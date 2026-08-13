# ThinkTech Q&A

## Description

ThinkTech Q&A is an anonymous, real-time Q&A platform being developed for ThinkTech Society's orientation/induction sessions. It enables students to submit questions anonymously while providing moderators with tools to review questions and display them live during orientation events.

## Current Status

`Phase 4 — Real Student Submission`

## Tech Stack

* **Next.js** (App Router)
* **TypeScript**
* **Tailwind CSS**
* **Supabase JavaScript Client** (`@supabase/supabase-js`)
* **PostgreSQL** (Schema, RLS, Indexes, Constraints)
* **Supabase Realtime** — *planned*

## Database Setup

See [SUPABASE.md](file:///d:/Programming/web%20projects/thinktech-qna/docs/SUPABASE.md) for database schema specifications, environment setup, and migration instructions.

## Development

First, install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

## Application Routes

* `/ask` — Anonymous Student Question Submission
* `/moderator` — Moderator Dashboard & Control Panel
* `/display` — Live Event Stage Display
