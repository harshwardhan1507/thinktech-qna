-- Migration: Phase 7 — Public Stage Display RPC
-- Provides a narrow, read-only public endpoint to fetch the single active displayed question
-- without granting anonymous SELECT access to the questions table.

CREATE OR REPLACE FUNCTION public.get_displayed_question()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'id', id,
        'content', content,
        'created_at', created_at,
        'displayed_at', displayed_at
    ) INTO v_result
    FROM public.questions
    WHERE status = 'displayed'
    LIMIT 1;

    RETURN v_result;
END;
$$;

-- Security grants: Revoke from PUBLIC, grant exclusively to anon and authenticated
REVOKE EXECUTE ON FUNCTION public.get_displayed_question() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_displayed_question() TO anon, authenticated;
