-- Migration: Add moderator RLS policies checking app_metadata.role = 'moderator'
-- Phase 5 — Moderator Auth + Dashboard

-- 1. Policy for SELECT: Allow authenticated users with app_metadata.role = 'moderator' to read all questions
CREATE POLICY "Moderators can read questions"
    ON public.questions
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
    );

-- 2. Policy for UPDATE: Allow authenticated users with app_metadata.role = 'moderator' to update questions
CREATE POLICY "Moderators can update questions"
    ON public.questions
    FOR UPDATE
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
    );
