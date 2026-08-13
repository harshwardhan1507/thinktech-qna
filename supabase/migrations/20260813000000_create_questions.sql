-- Migration: Create questions table and question_status enum
-- Phase 3 — Supabase Database Foundation

-- 1. Create question status enum type
CREATE TYPE question_status AS ENUM ('pending', 'displayed', 'answered', 'dismissed');

-- 2. Create questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    status question_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    displayed_at TIMESTAMPTZ NULL,
    answered_at TIMESTAMPTZ NULL,
    dismissed_at TIMESTAMPTZ NULL,

    -- Content constraint: minimum 3 trimmed characters, maximum 500 characters
    CONSTRAINT questions_content_length CHECK (
        char_length(trim(content)) >= 3 AND char_length(trim(content)) <= 500
    )
);

-- 3. Create performance indexes
CREATE INDEX questions_status_idx ON questions(status);
CREATE INDEX questions_created_at_idx ON questions(created_at DESC);

-- 4. Invariant: At most ONE question can have status 'displayed' at any time
CREATE UNIQUE INDEX questions_single_displayed_idx ON questions(status) WHERE status = 'displayed';

-- 5. Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policy: Allow anonymous users (students) to insert pending questions
CREATE POLICY "Allow anonymous question insertion"
    ON questions
    FOR INSERT
    TO anon
    WITH CHECK (status = 'pending');
