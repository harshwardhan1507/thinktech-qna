-- Migration: Phase 8 — Supabase Realtime Broadcast from Database
-- Broadcasts sanitized question lifecycle & display events to topic 'thinktech:qna'

CREATE OR REPLACE FUNCTION public.broadcast_question_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_event_type text;
    v_display_payload jsonb;
BEGIN
    -- Determine event type
    IF TG_OP = 'INSERT' THEN
        v_event_type := 'QUESTION_CREATED';
    ELSE
        v_event_type := 'QUESTION_STATE_CHANGED';
    END IF;

    -- Determine sanitized display payload
    IF NEW.status = 'displayed' THEN
        v_display_payload := jsonb_build_object(
            'id', NEW.id,
            'content', NEW.content,
            'created_at', NEW.created_at,
            'displayed_at', NEW.displayed_at
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'displayed' AND NEW.status != 'displayed') THEN
        v_display_payload := jsonb_build_object(
            'id', NULL,
            'content', NULL,
            'created_at', NULL,
            'displayed_at', NULL
        );
    ELSE
        v_display_payload := NULL;
    END IF;

    -- Send Realtime Broadcast using Supabase 4-argument signature:
    -- realtime.send(payload, event, topic, is_private)
    PERFORM realtime.send(
        jsonb_build_object(
            'id', NEW.id,
            'status', NEW.status,
            'display', v_display_payload
        ),
        v_event_type,
        'thinktech:qna',
        false
    );

    RETURN NEW;
END;
$$;

-- Create trigger on public.questions table
DROP TRIGGER IF EXISTS broadcast_question_changes_trigger ON public.questions;

CREATE TRIGGER broadcast_question_changes_trigger
    AFTER INSERT OR UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.broadcast_question_changes();
