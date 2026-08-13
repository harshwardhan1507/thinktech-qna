# Supabase Architecture & Database Reference

This document provides the authoritative PostgreSQL database specification, security model, triggers, RPCs, and Realtime architecture for ThinkTech Q&A.

---

## 1. Database Schema (`public.questions`)

```sql
CREATE TYPE public.question_status AS ENUM (
    'pending',
    'displayed',
    'answered',
    'dismissed'
);

CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_policy_uuid(),
    content TEXT NOT NULL,
    status public.question_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    displayed_at TIMESTAMPTZ NULL,
    answered_at TIMESTAMPTZ NULL,
    dismissed_at TIMESTAMPTZ NULL
);
```

### Constraints & Indexes
- `questions_single_displayed_idx`: Partial unique index `CREATE UNIQUE INDEX questions_single_displayed_idx ON public.questions (status) WHERE status = 'displayed';` (Guarantees max 1 active displayed question).
- Indexes on `status` and `created_at` for queue performance.

---

## 2. Row Level Security (RLS) & Role Model

Row Level Security is enabled on `public.questions`:

```sql
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
```

### Policies

#### Anonymous Student Role (`anon`)
```sql
CREATE POLICY "Anon Student Insert Policy"
ON public.questions
FOR INSERT
TO anon
WITH CHECK (
    status = 'pending'
    AND displayed_at IS NULL
    AND answered_at IS NULL
    AND dismissed_at IS NULL
);
```
- Direct `SELECT`, `UPDATE`, `DELETE` are **DENIED** for `anon`.

#### Authenticated Moderator Role (`authenticated`)
```sql
CREATE POLICY "Moderator Select Policy"
ON public.questions
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
);

CREATE POLICY "Moderator Update Policy"
ON public.questions
FOR UPDATE
TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
);
```
- Direct `DELETE` remains **DISABLED** for all roles.

---

## 3. Database Triggers

### 3.1 Question Lifecycle Trigger
`enforce_question_lifecycle_trigger` BEFORE UPDATE ON `public.questions` executes `public.enforce_question_lifecycle()`:
- Enforces immutability of `id`, `content`, `created_at`.
- Validates state transitions (`pending -> displayed`, `pending -> dismissed`, `displayed -> answered`).
- Rejects invalid transitions with SQL error `45000`.

### 3.2 Realtime Broadcast Trigger
`broadcast_question_changes_trigger` AFTER INSERT OR UPDATE ON `public.questions` executes `public.broadcast_question_changes()`:
- `SECURITY DEFINER SET search_path = public, pg_catalog`.
- Executes Supabase 4-argument Broadcast signature:
  `realtime.send(payload, event, 'thinktech:qna', false)`.
- Broadcasts sanitized payload (`{ id, content, created_at, displayed_at }` or `null`) to public channel `thinktech:qna`.

---

## 4. Stored Procedures & RPCs

### 4.1 Atomic `next_question()` RPC
```sql
CREATE OR REPLACE FUNCTION public.next_question()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$ ... $$;
```
- Restored exclusively to `authenticated` role (`REVOKE EXECUTE FROM PUBLIC, anon`).
- Acquires `FOR UPDATE` row locks in order (`displayed` question first, oldest `pending` question second).
- Atomically transitions active question -> `answered` and oldest pending question -> `displayed`.

### 4.2 Public Stage Display `get_displayed_question()` RPC
```sql
CREATE OR REPLACE FUNCTION public.get_displayed_question()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$ ... $$;
```
- Granted to `anon` and `authenticated` (`REVOKE EXECUTE FROM PUBLIC`).
- Returns exclusively `{ id, content, created_at, displayed_at }` for active question (`status = 'displayed'`) or `null`.

---

## 5. Security & Isolation Summary

1. **Anonymous Isolation**: `/ask` student submissions execute via a dedicated `supabaseAnon` client configured with `persistSession: false` and `storageKey: "sb-anon-client-storage"`.
2. **Field Protection**: Answered/dismissed history, user identity, and internal moderation metadata are never broadcast to public display sockets.
3. **Credentials Safety**: Zero service-role keys or passwords are in client source code or committed files.
