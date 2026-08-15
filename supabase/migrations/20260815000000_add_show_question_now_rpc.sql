-- Migration: Add Atomic show_question_now RPC
-- Enables a moderator to immediately push any pending question to the display stage,
-- atomically marking the current displayed question as answered (if present).

CREATE OR REPLACE FUNCTION public.show_question_now(question_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_displayed_id uuid;
    v_target_id uuid;
    v_target_status public.question_status;
    v_now timestamptz := NOW();
BEGIN
    -- 1. Verify moderator role authorization
    IF (auth.jwt() -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'moderator' THEN
        RAISE EXCEPTION 'Unauthorized: Moderator authorization required' USING ERRCODE = '42501';
    END IF;

    -- 2. Lock acquiring order 1: Find & lock current displayed question
    SELECT id INTO v_displayed_id
    FROM public.questions
    WHERE status = 'displayed'
    FOR UPDATE;

    -- 3. Lock acquiring order 2: Find & lock requested target question
    SELECT id, status INTO v_target_id, v_target_status
    FROM public.questions
    WHERE id = question_id
    FOR UPDATE;

    -- 4. Verify target existence
    IF v_target_id IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'not_found',
            'displayed_question_id', NULL,
            'answered_question_id', NULL
        );
    END IF;

    -- 5. Verify target status is 'pending'
    IF v_target_status != 'pending' THEN
        RETURN jsonb_build_object(
            'status', 'stale_state',
            'displayed_question_id', NULL,
            'answered_question_id', NULL
        );
    END IF;

    -- 6. Transition current displayed question to answered (if one exists)
    IF v_displayed_id IS NOT NULL THEN
        UPDATE public.questions
        SET status = 'answered',
            answered_at = v_now
        WHERE id = v_displayed_id;
    END IF;

    -- 7. Transition requested target question to displayed
    UPDATE public.questions
    SET status = 'displayed',
        displayed_at = v_now
    WHERE id = question_id;

    -- 8. Return structured success result
    RETURN jsonb_build_object(
        'status', 'success',
        'displayed_question_id', question_id,
        'answered_question_id', v_displayed_id
    );
END;
$$;

-- Security grants: revoke execution from public & anon, grant to authenticated only
REVOKE EXECUTE ON FUNCTION public.show_question_now(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.show_question_now(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.show_question_now(uuid) TO authenticated;
