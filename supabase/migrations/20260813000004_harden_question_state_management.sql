-- Migration: Phase 6 — Harden Question State Management
-- Implements PostgreSQL lifecycle trigger, timestamp invariants, immutability protection, and row-locked next_question() RPC

-- 1. Trigger function for enforcing lifecycle transitions & field immutability
CREATE OR REPLACE FUNCTION public.enforce_question_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check immutability of id, content, and created_at
    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Question ID is immutable' USING ERRCODE = '45000';
    END IF;

    IF NEW.content IS DISTINCT FROM OLD.content THEN
        RAISE EXCEPTION 'Question content is immutable' USING ERRCODE = '45000';
    END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Question created_at is immutable' USING ERRCODE = '45000';
    END IF;

    -- If status hasn't changed, allow non-status updates (if any)
    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
        RETURN NEW;
    END IF;

    -- Enforce valid status transitions & timestamp invariants
    -- Transition: pending -> displayed
    IF OLD.status = 'pending' AND NEW.status = 'displayed' THEN
        IF NEW.displayed_at IS NULL THEN
            RAISE EXCEPTION 'displayed_at timestamp is required when transitioning to displayed' USING ERRCODE = '45000';
        END IF;
        IF NEW.answered_at IS NOT NULL OR NEW.dismissed_at IS NOT NULL THEN
            RAISE EXCEPTION 'answered_at and dismissed_at must be NULL when transitioning to displayed' USING ERRCODE = '45000';
        END IF;
        RETURN NEW;
    END IF;

    -- Transition: pending -> dismissed
    IF OLD.status = 'pending' AND NEW.status = 'dismissed' THEN
        IF NEW.dismissed_at IS NULL THEN
            RAISE EXCEPTION 'dismissed_at timestamp is required when transitioning to dismissed' USING ERRCODE = '45000';
        END IF;
        IF NEW.displayed_at IS NOT NULL OR NEW.answered_at IS NOT NULL THEN
            RAISE EXCEPTION 'displayed_at and answered_at must be NULL when transitioning to dismissed' USING ERRCODE = '45000';
        END IF;
        RETURN NEW;
    END IF;

    -- Transition: displayed -> answered
    IF OLD.status = 'displayed' AND NEW.status = 'answered' THEN
        IF NEW.answered_at IS NULL THEN
            RAISE EXCEPTION 'answered_at timestamp is required when transitioning to answered' USING ERRCODE = '45000';
        END IF;
        IF NEW.displayed_at IS NULL THEN
            RAISE EXCEPTION 'displayed_at timestamp must be preserved when transitioning to answered' USING ERRCODE = '45000';
        END IF;
        IF NEW.dismissed_at IS NOT NULL THEN
            RAISE EXCEPTION 'dismissed_at must be NULL when transitioning to answered' USING ERRCODE = '45000';
        END IF;
        RETURN NEW;
    END IF;

    -- All other status transitions are forbidden
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status USING ERRCODE = '45000';
END;
$$;

-- Create trigger on public.questions table
DROP TRIGGER IF EXISTS enforce_question_lifecycle_trigger ON public.questions;

CREATE TRIGGER enforce_question_lifecycle_trigger
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_question_lifecycle();


-- 2. Atomic next_question() RPC with row locking
CREATE OR REPLACE FUNCTION public.next_question()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_displayed_id uuid;
    v_pending_id uuid;
    v_now timestamptz := NOW();
BEGIN
    -- Verify moderator role authorization
    IF (auth.jwt() -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'moderator' THEN
        RAISE EXCEPTION 'Unauthorized: Moderator authorization required' USING ERRCODE = '42501';
    END IF;

    -- Lock acquiring order 1: Find & lock current displayed question
    SELECT id INTO v_displayed_id
    FROM public.questions
    WHERE status = 'displayed'
    FOR UPDATE;

    -- Lock acquiring order 2: Find & lock oldest pending question (FIFO)
    SELECT id INTO v_pending_id
    FROM public.questions
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE;

    -- Step A: Mark current displayed question as answered (if present)
    IF v_displayed_id IS NOT NULL THEN
        UPDATE public.questions
        SET status = 'answered',
            answered_at = v_now
        WHERE id = v_displayed_id;
    END IF;

    -- Step B: Mark oldest pending question as displayed (if present)
    IF v_pending_id IS NOT NULL THEN
        UPDATE public.questions
        SET status = 'displayed',
            displayed_at = v_now
        WHERE id = v_pending_id;
    END IF;

    -- Return JSON result summary
    RETURN jsonb_build_object(
        'status', CASE WHEN v_pending_id IS NOT NULL THEN 'success' ELSE 'no_pending' END,
        'displayed_question_id', v_pending_id,
        'answered_question_id', v_displayed_id
    );
END;
$$;

-- Explicit RPC security grants
REVOKE EXECUTE ON FUNCTION public.next_question() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.next_question() FROM anon;
GRANT EXECUTE ON FUNCTION public.next_question() TO authenticated;
