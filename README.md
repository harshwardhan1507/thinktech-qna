# ThinkTech Q&A

Anonymous, real-time Q&A platform for ThinkTech Society's orientation and induction sessions. Enables students to submit questions anonymously while providing moderators with tools to review questions and display them live during orientation events.

## Current Status

`Phases 12–14 — Production Hardening & Event Preparation Complete`

---

## Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Minimalist Monochrome System)
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth
- **Realtime**: Database-Triggered Realtime Broadcast (`thinktech:qna`)
- **QR Generator**: `qrcode.react` (`QRCodeSVG`)

---

## Application Routes

- `/` — Landing page with route navigation
- `/ask` — Anonymous Student Question Submission
- `/moderator` — Moderator Control Room & Queue Management
- `/display` — Live Orientation Stage Projector Display

---

## Prerequisites

- Node.js `^18.17.0` or `>= 20.0.0`
- npm `^9.0.0` or `>= 10.0.0`
- A Supabase Project (with PostgreSQL, Auth, and Realtime enabled)

---

## Quick Start & Local Development

1. **Clone the repository and install dependencies**:
   ```bash
   git clone https://github.com/harshwardhan1507/thinktech-qna.git
   cd thinktech-qna
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file based on `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```
   Set your Supabase URL and Anonymous Key:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Migrations & Supabase Setup

Migrations must be applied in sequential order using the Supabase CLI:

```bash
npx supabase db push
```

### Migration History

1. `20260813000000_create_questions.sql`: Creates `public.questions` table, `question_status` enum (`pending`, `displayed`, `answered`, `dismissed`), indexes, and RLS policies.
2. `20260813000001_harden_single_displayed_question.sql`: Enforces max 1 displayed question via partial unique index `questions_single_displayed_idx`.
3. `20260813000002_create_moderator_user.sql`: Configures moderator authorization checks based on `(auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'`.
4. `20260813000004_harden_question_state_management.sql`: Implements BEFORE UPDATE lifecycle trigger `enforce_question_lifecycle_trigger` and atomic `next_question()` RPC with row locking.
5. `20260813000005_add_public_display_rpc.sql`: Implements public stage RPC `get_displayed_question()` returning active question or `null`.
6. `20260813000006_add_realtime_broadcast.sql`: Implements database-triggered Broadcast `broadcast_question_changes()` on topic `thinktech:qna`.

---

## Security Model & RLS Policies

| Role | Table SELECT | Table UPDATE | Table DELETE | Table INSERT | RPC / Broadcast |
|---|---|---|---|---|---|
| `anon` | **DENIED** | **DENIED** | **DENIED** | **ALLOWED** (write-only) | `get_displayed_question()` EXECUTE, Broadcast subscribe |
| `authenticated` (moderator) | **ALLOWED** | **ALLOWED** | **DENIED** | **DENIED** | `next_question()` EXECUTE, Broadcast subscribe |

---

## Moderator Account Provisioning

To create a moderator account:

1. Open **Supabase Dashboard > Authentication > Users**.
2. Click **Create User** and enter moderator email and password.
3. Open **Supabase SQL Editor** and assign the `moderator` role to `raw_app_meta_data`:
   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = raw_app_meta_data || '{"role": "moderator"}'::jsonb
   WHERE email = 'moderator@thinktech.org';
   ```

---

## Event-Day Operational Runbook

### Before the Event (Pre-Flight Checks)
1. **Moderator Laptop**: Open `/moderator`, log in, and verify connection badge displays `LIVE`.
2. **Projector / Stage Display**: Open `/display` on the projector screen at `1920×1080`. Verify connection badge displays `LIVE` and QR code renders clearly (~320px).
3. **QR Verification**: Scan the stage QR code using a mobile phone camera. Confirm it opens `/ask`.
4. **End-to-End Test**: Submit a test question on the phone -> verify it appears on `/moderator` live -> click `SHOW` -> verify stage display updates live -> click `NEXT` -> verify queue advances.

### During the Event
- Students submit questions via QR code (`/ask`).
- Moderator reviews questions on `/moderator` and pushes selected questions to stage (`SHOW` / `NEXT`).
- Disconnected devices automatically reconnect and perform an authoritative background refresh upon reconnection.

---

## Verification & Build Commands

```bash
npm run lint
npm run build
```
