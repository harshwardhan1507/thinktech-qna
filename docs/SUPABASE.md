# Supabase Database Documentation

> Phase 4 — Real Student Submission Specification and Setup Guide for ThinkTech Q&A.

---

## 1. Overview

ThinkTech Q&A uses **Supabase PostgreSQL** as its primary data store. 

During **Phase 3**, the database schema, migration scripts, constraints, indexes, Row Level Security (RLS) policies, TypeScript types, and JavaScript client SDK were established.

During **Phase 4**, the `/ask` student submission path was connected to Supabase using a **write-only anonymous `INSERT`** pattern.

> **Phase 4 Boundary Note**: The `/ask` student page performs live writes to PostgreSQL via Supabase. Other application routes (`/moderator`, `/display`) remain intentionally connected to local mock data (`src/lib/mock/questions.ts`) until their respective integration phases.

---

## 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required public environment variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

*Never expose server-side service role keys to client bundles.*

---

## 3. Database Schema

### 3.1 Custom Enum: `question_status`

The database defines a PostgreSQL enum for strict lifecycle state management:

```sql
CREATE TYPE question_status AS ENUM ('pending', 'displayed', 'answered', 'dismissed');
```

Allowed transitions (enforced in application layer during future phases):

```text
pending ──► displayed ──► answered
   │
   └──► dismissed
```

---

### 3.2 Table: `questions`

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    status question_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    displayed_at TIMESTAMPTZ NULL,
    answered_at TIMESTAMPTZ NULL,
    dismissed_at TIMESTAMPTZ NULL,

    CONSTRAINT questions_content_length CHECK (
        char_length(trim(content)) >= 3 AND char_length(trim(content)) <= 500
    )
);
```

#### Field Specifications:

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | No | `gen_random_uuid()` | Automatically generated primary key |
| `content` | `TEXT` | No | None | Question body (3–500 trimmed characters) |
| `status` | `question_status` | No | `'pending'` | Current question lifecycle state |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | Authoritative creation timestamp |
| `displayed_at` | `TIMESTAMPTZ` | Yes | `NULL` | Timestamp when question was sent to display |
| `answered_at` | `TIMESTAMPTZ` | Yes | `NULL` | Timestamp when question was marked answered |
| `dismissed_at` | `TIMESTAMPTZ` | Yes | `NULL` | Timestamp when question was dismissed |

---

## 4. Indexes & Invariants

### 4.1 Performance Indexes

```sql
CREATE INDEX questions_status_idx ON questions(status);
CREATE INDEX questions_created_at_idx ON questions(created_at DESC);
```

### 4.2 Invariant: Single Displayed Question

To guarantee at most **one** question is active on the live presentation stage at any time, a database-level partial unique index is enforced:

```sql
CREATE UNIQUE INDEX questions_single_displayed_idx 
ON questions(status) 
WHERE status = 'displayed';
```

If a client attempts to update a second question to `displayed` without changing the existing displayed question's status, PostgreSQL will reject the transaction.

---

## 5. Row Level Security (RLS)

RLS is enabled on the `questions` table:

```sql
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
```

### 5.1 Anonymous Insertion Policy

Anonymous student users (`anon` role) are permitted to insert new questions into the database provided the initial `status` is `'pending'`:

```sql
CREATE POLICY "Allow anonymous question insertion"
    ON questions
    FOR INSERT
    TO anon
    WITH CHECK (status = 'pending');
```

### 5.2 Access Boundary Matrix

| Operation | Role | Policy | Result |
|---|---|---|---|
| `INSERT` | `anon` | `status = 'pending'` | **ALLOWED** |
| `SELECT` | `anon` | None | **DENIED** (Default RLS) |
| `UPDATE` | `anon` | None | **DENIED** (Default RLS) |
| `DELETE` | `anon` | None | **DENIED** (Default RLS) |

---

## 6. Migration Management

Migrations are stored in:

```text
supabase/migrations/
└── 20260813000000_create_questions.sql
```

### Local Development Setup (Supabase CLI)

1. Start local Supabase containers (requires Docker):
   ```bash
   supabase start
   ```

2. Reset local database and apply all migrations:
   ```bash
   supabase db reset
   ```

3. Link to remote project (optional):
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

---

## 7. Supabase Client Integration

The JavaScript client is configured at `src/lib/supabase/client.ts` using `@supabase/supabase-js`:

```typescript
import { supabase } from "@/lib/supabase";
```

TypeScript database types are exported from `src/types/database.ts` and integrated with `Database`.

---

## 8. Student Data Access Pattern (Phase 4)

In **Phase 4**, student question submissions execute a write-only `INSERT` operation without `.select()`:

```typescript
import { createQuestion } from "@/lib/questions";

const { error } = await createQuestion("Can first-year students join ThinkTech?");
```

Implementation details (`src/lib/questions/create-question.ts`):

```typescript
export async function createQuestion(content: string): Promise<{ error: Error | null }> {
  const trimmed = content.trim();

  const { error } = await supabase
    .from("questions")
    .insert({ content: trimmed });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}
```

This enforces a security model where anonymous student clients are strictly **write-only**.

---

## 9. Moderator Authentication & Authorization (Phase 5)

In **Phase 5**, moderator functionality requires a valid Supabase Auth session with `app_metadata.role = 'moderator'`.

### 9.1 Security Policy (RLS)

```sql
-- Allow authenticated users with app_metadata.role = 'moderator' to read questions
CREATE POLICY "Moderators can read questions"
    ON public.questions
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
    );

-- Allow authenticated users with app_metadata.role = 'moderator' to update questions
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
```

### 9.2 Provisioning a Moderator User

To create/authorize a moderator user in Supabase:

1. Create a user via **Supabase Dashboard > Authentication > Users** (e.g. `moderator@thinktech.org`).
2. Run the following SQL query in **Supabase SQL Editor** to assign the `moderator` role to `raw_app_meta_data`:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "moderator"}'::jsonb
WHERE email = 'moderator@thinktech.org';
```
