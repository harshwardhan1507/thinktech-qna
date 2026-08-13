# ThinkTech Q&A — System Architecture

> Architecture specification for the ThinkTech Society anonymous live Q&A platform.

---

# 1. Overview

**ThinkTech Q&A** is a real-time, anonymous question moderation system designed specifically for ThinkTech Society orientation and induction events.

The system has three primary interfaces:

```text
┌──────────────────┐
│  STUDENT CLIENT  │
│      /ask        │
└────────┬─────────┘
         │
         │ Submit Question
         ▼
┌──────────────────────────┐
│       SUPABASE           │
│                          │
│ PostgreSQL + Realtime    │
└──────────┬───────────────┘
           │
           │ Realtime Events
           ▼
┌──────────────────────────┐
│   MODERATOR DASHBOARD    │
│       /moderator         │
└──────────┬───────────────┘
           │
           │ Show / Dismiss
           ▼
┌──────────────────────────┐
│      LIVE DISPLAY        │
│        /display          │
└──────────────────────────┘
```

The architecture intentionally avoids unnecessary backend complexity.

There is no separate Express server, WebSocket server, or microservice layer in the MVP.

---

# 2. Architectural Principles

The system follows these principles:

### Simplicity

Use managed infrastructure instead of building infrastructure unnecessarily.

### Realtime-first

The moderator and display should react to question changes without manual refreshes.

### Anonymous by design

Students do not need accounts or identifying information to submit questions.

### Human moderation

The moderator remains the final authority over what appears publicly.

### Separation of concerns

Student, moderator, and display interfaces have different responsibilities.

### Event reliability

The application must remain simple enough to troubleshoot quickly during a live orientation.

---

# 3. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │      STUDENT        │
                         │                     │
                         │ Volunteer Phone     │
                         │        OR           │
                         │ Student Phone + QR  │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │      NEXT.JS        │
                         │                     │
                         │       /ask          │
                         └──────────┬──────────┘
                                    │
                                    │ Insert
                                    ▼
                     ┌──────────────────────────────┐
                     │           SUPABASE           │
                     │                              │
                     │      PostgreSQL Database     │
                     │                              │
                     │       questions table        │
                     └──────────────┬───────────────┘
                                    │
                          Realtime Events
                                    │
                     ┌──────────────┴───────────────┐
                     │                              │
                     ▼                              ▼
          ┌─────────────────────┐       ┌─────────────────────┐
          │      MODERATOR      │       │       DISPLAY       │
          │                     │       │                     │
          │    /moderator       │       │      /display       │
          └──────────┬──────────┘       └─────────────────────┘
                     │
                     │ UPDATE STATUS
                     ▼
              ┌───────────────┐
              │   SUPABASE    │
              │   questions   │
              └───────────────┘
```

---

# 4. Application Layers

The application can be divided into five logical layers.

```text
┌────────────────────────────────────────────┐
│             PRESENTATION LAYER             │
│                                             │
│ /ask     /moderator     /display            │
└──────────────────────┬─────────────────────┘
                       │
┌──────────────────────▼─────────────────────┐
│             COMPONENT LAYER                │
│                                             │
│ UI + Q&A + Moderator + Display Components  │
└──────────────────────┬─────────────────────┘
                       │
┌──────────────────────▼─────────────────────┐
│              APPLICATION LAYER             │
│                                             │
│ Question Operations + Validation + State   │
└──────────────────────┬─────────────────────┘
                       │
┌──────────────────────▼─────────────────────┐
│              DATA ACCESS LAYER             │
│                                             │
│ Supabase Client + Realtime Subscriptions   │
└──────────────────────┬─────────────────────┘
                       │
┌──────────────────────▼─────────────────────┐
│                 DATA LAYER                 │
│                                             │
│ PostgreSQL / Supabase                      │
└────────────────────────────────────────────┘
```

The exact implementation can remain lightweight. These layers are conceptual boundaries rather than a requirement to create excessive abstractions.

---

# 5. Frontend Architecture

Use:

```text
Next.js
App Router
TypeScript
Tailwind CSS
```

Recommended structure:

```text
src/
│
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   │
│   ├── ask/
│   │   └── page.tsx
│   │
│   ├── moderator/
│   │   └── page.tsx
│   │
│   └── display/
│       └── page.tsx
│
├── components/
│   ├── ui/
│   ├── ask/
│   ├── moderator/
│   └── display/
│
├── lib/
│   ├── supabase/
│   ├── questions/
│   └── utils/
│
├── types/
│   └── question.ts
│
└── config/
    └── site.ts
```

---

# 6. Route Responsibilities

## `/`

Landing / entry point.

Responsibilities:

* ThinkTech branding
* Basic navigation
* Project introduction

This route is not part of the live event workflow.

---

## `/ask`

Student interface.

Responsibilities:

* Accept anonymous questions
* Validate input
* Submit question
* Show submission state
* Show errors
* Remain mobile-first

It should not:

* Access moderator functionality
* Change question status
* Read the complete question queue

---

## `/moderator`

Moderator interface.

Responsibilities:

* Read pending questions
* View question statistics
* Show questions
* Dismiss questions
* Mark questions answered
* Move to next question

This route requires authorization once authentication is implemented.

---

## `/display`

Audience-facing interface.

Responsibilities:

* Show the currently selected question
* React to realtime question changes
* Display QR code
* Show connection state where appropriate

It should not expose:

* Moderator controls
* Question queue
* Student information
* Database credentials

---

# 7. Question Domain Model

The core domain object is:

```text
Question
```

Conceptually:

```typescript
type QuestionStatus =
  | "pending"
  | "displayed"
  | "answered"
  | "dismissed";

interface Question {
  id: string;
  content: string;
  status: QuestionStatus;
  created_at: string;
  displayed_at: string | null;
  answered_at: string | null;
  dismissed_at: string | null;
}
```

The domain model should remain small.

Do not add fields simply because they might be useful later.

---

# 8. Question Lifecycle

The question lifecycle is:

```text
                  ┌─────────────┐
                  │   PENDING   │
                  └──────┬──────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
        ┌───────────┐        ┌─────────────┐
        │ DISPLAYED │        │  DISMISSED  │
        └─────┬─────┘        └─────────────┘
              │
              ▼
        ┌───────────┐
        │ ANSWERED  │
        └───────────┘
```

Expected transitions:

```text
pending → displayed
pending → dismissed
displayed → answered
```

The application should prevent invalid transitions.

For example:

```text
dismissed → displayed
answered → pending
```

should not occur through normal moderator actions.

---

# 9. Data Architecture

Supabase provides:

```text
PostgreSQL
+
Realtime
+
Authentication
+
Row Level Security
```

Only the required services should be used.

Initial database:

```text
questions
```

Recommended schema:

```text
questions
────────────────────────────────
id              UUID
content         TEXT
status          ENUM
created_at      TIMESTAMPTZ
displayed_at    TIMESTAMPTZ NULL
answered_at     TIMESTAMPTZ NULL
dismissed_at    TIMESTAMPTZ NULL
```

---

# 10. Database Responsibilities

The database is the source of truth for question state.

The frontend should not treat local state as authoritative.

Example:

```text
Moderator clicks SHOW
        ↓
Database updates status
        ↓
Realtime event generated
        ↓
Display receives event
        ↓
Display updates
```

This prevents the moderator and display from becoming permanently out of sync.

---

# 11. Supabase Client Architecture

Create a dedicated Supabase client layer.

Example conceptual structure:

```text
src/lib/supabase/
├── client.ts
└── server.ts
```

Use the appropriate client depending on execution context.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to browser code.

Public browser configuration may use:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

# 12. Question Data Access

Keep question-related database operations separate from UI components.

Conceptually:

```text
src/lib/questions/
├── create-question.ts
├── get-questions.ts
├── update-question-status.ts
└── subscribe-to-questions.ts
```

The exact file structure may be simplified if the implementation remains small.

The important rule is:

> UI components should not contain large amounts of database logic.

---

# 13. Student Submission Flow

```text
Student
   │
   │ Types question
   ▼
/ask
   │
   │ Client validation
   ▼
Question operation
   │
   │ INSERT
   ▼
Supabase
   │
   ▼
questions
   │
   │ Realtime event
   ▼
Moderator
```

Student input:

```text
3–500 characters
```

The question should be trimmed before insertion.

No identifying information should be required.

---

# 14. Moderator Flow

```text
Moderator opens /moderator
            │
            ▼
      Fetch questions
            │
            ▼
       Pending queue
            │
       ┌────┴────┐
       │         │
      SHOW    DISMISS
       │         │
       ▼         ▼
   displayed  dismissed
       │
       ▼
   Audience sees it
       │
       ▼
     ANSWER
```

Moderator actions modify the database.

The database then becomes the source for the live display.

---

# 15. Display Flow

```text
/display
    │
    ▼
Fetch currently displayed question
    │
    ▼
Subscribe to question changes
    │
    ▼
Moderator changes question
    │
    ▼
Supabase Realtime event
    │
    ▼
Display updates
```

The display should not poll the database continuously.

---

# 16. Realtime Architecture

Supabase Realtime is responsible for synchronizing state.

Primary realtime events:

### New question

```text
Student
  ↓
INSERT
  ↓
Supabase Realtime
  ↓
Moderator
```

### Question displayed

```text
Moderator
  ↓
UPDATE status = displayed
  ↓
Supabase Realtime
  ↓
Display
```

### Question answered

```text
Moderator
  ↓
UPDATE status = answered
  ↓
Supabase Realtime
  ↓
Moderator / Display
```

---

# 17. Realtime Connection State

Both moderator and display interfaces should maintain a conceptual connection state:

```text
CONNECTED
DISCONNECTED
RECONNECTING
```

The UI should communicate connection problems without exposing technical implementation details to the audience.

For example:

Moderator:

```text
● Live
```

or:

```text
○ Reconnecting...
```

Display:

Use a subtle indicator rather than a large technical error.

---

# 18. Authentication Architecture

Authentication is required for moderator functionality.

Student:

```text
No authentication
```

Moderator:

```text
Authenticated
```

Display:

```text
Public read-only interface
```

Conceptually:

```text
                 APPLICATION
                      │
        ┌─────────────┼─────────────┐
        │             │             │
      Student      Moderator      Display
        │             │             │
     Public        Authenticated   Public
```

Moderator authentication should eventually use Supabase Auth.

Do not rely on secret URLs.

---

# 19. Authorization

Authentication and authorization are separate concerns.

A logged-in user should not automatically be trusted to perform every operation.

Database policies should enforce permissions.

Conceptually:

```text
Student
  └── INSERT question

Moderator
  ├── READ questions
  ├── UPDATE question status
  └── READ moderation data

Display
  └── READ appropriate public question state
```

Row Level Security should enforce these boundaries.

---

# 20. Privacy Architecture

The application intentionally avoids collecting:

```text
Name
Email
Student ID
Phone number
Account information
```

unless future requirements explicitly change.

The minimal stored student-submitted data is:

```text
Question content
Timestamp
Question state
```

Avoid IP logging or other identifying metadata unless there is a concrete operational/security requirement.

---

# 21. QR Architecture

The QR code is an access mechanism, not a separate application.

The QR should resolve to:

```text
${NEXT_PUBLIC_APP_URL}/ask
```

Flow:

```text
Audience
   │
   │ Scan QR
   ▼
/ask
   │
   ▼
Submit question
```

The same `/ask` interface is used whether the student:

* scans the QR
* uses the volunteer's phone

This keeps the system simple.

---

# 22. Event-Day Network Architecture

Expected environment:

```text
                    INTERNET / LOCAL NETWORK
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        Student Phones   Moderator Laptop   Display
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
                          Supabase
```

All clients require internet access for the hosted Supabase/Vercel architecture.

The system should gracefully communicate connection failures.

---

# 23. Deployment Architecture

Recommended:

```text
                 GitHub
                    │
                    ▼
                 Vercel
                    │
                    ▼
              Next.js App
                    │
                    │
                    ▼
                Supabase
             ┌──────┴──────┐
             │             │
         PostgreSQL     Realtime
```

Vercel hosts the Next.js application.

Supabase provides:

* PostgreSQL
* Realtime
* Authentication
* RLS

---

# 24. Environment Configuration

Expected variables:

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Potential server-only variables should never use the `NEXT_PUBLIC_` prefix.

Never commit:

```text
.env.local
```

---

# 25. Error Handling Architecture

Errors should be handled at the appropriate layer.

```text
Database error
      ↓
Data layer
      ↓
Application layer
      ↓
UI-friendly error
```

Do not expose raw database errors.

Student example:

```text
Unable to submit your question.
Please try again.
```

Moderator example:

```text
Unable to update the question.
Check your connection and try again.
```

Display example:

```text
Reconnecting...
```

---

# 26. Loading States

Every asynchronous interface should have an intentional loading state.

Student:

```text
Submitting...
```

Moderator:

```text
Loading questions...
```

Display:

```text
Loading live Q&A...
```

Avoid blank screens during network operations.

---

# 27. Component Boundaries

Use components based on responsibility.

Example:

```text
components/
│
├── ui/
│   ├── Button
│   ├── Card
│   ├── Badge
│   └── ...
│
├── ask/
│   ├── QuestionForm
│   └── SubmissionSuccess
│
├── moderator/
│   ├── QuestionQueue
│   ├── QuestionCard
│   ├── StatsPanel
│   └── CurrentQuestion
│
└── display/
    ├── LiveQuestion
    ├── QRPrompt
    └── DisplayHeader
```

Do not allow page components to become monolithic.

---

# 28. State Management

Do not introduce global state management unless the application genuinely requires it.

For the MVP:

* React local state for UI state
* Supabase as the source of truth for question state
* Realtime subscriptions for synchronization

Avoid adding Redux, Zustand, or another global state library without a demonstrated need.

---

# 29. Security Boundaries

The browser is an untrusted environment.

Never trust:

```text
Client-side role checks
Hidden URLs
Disabled buttons
Hidden moderator routes
```

Security must ultimately be enforced through:

```text
Authentication
+
Authorization
+
RLS
```

---

# 30. Performance Principles

The application is expected to handle a relatively small event audience.

Do not optimize prematurely.

Priorities:

```text
1. Reliability
2. Correctness
3. Realtime synchronization
4. Fast UI
5. Maintainability
```

Avoid:

* unnecessary polling
* unnecessary API requests
* oversized dependencies
* excessive client-side JavaScript

---

# 31. Future Extensibility

The architecture should allow future features without requiring a rewrite.

Possible future additions:

```text
AI moderation
Question categories
Upvotes
Duplicate detection
Event analytics
Multiple events
Question timers
PWA
Text-to-speech
Advanced moderation
```

These should be added as extensions to the existing architecture rather than forcing the MVP to support them prematurely.

---

# 32. Non-Goals

The MVP does NOT require:

```text
❌ Microservices
❌ Custom WebSocket server
❌ Express backend
❌ Redis
❌ Kubernetes
❌ Complex state management
❌ AI infrastructure
❌ Native mobile applications
❌ Separate student API server
```

Supabase + Next.js is sufficient.

---

# 33. Final Architecture

The intended production architecture is:

```text
                           THINKTECH Q&A
                                │
                ┌───────────────┼────────────────┐
                │               │                │
                ▼               ▼                ▼
             /ask          /moderator         /display
                │               │                │
                │               │                │
                └───────────────┼────────────────┘
                                │
                         Supabase Client
                                │
                                ▼
                         ┌─────────────┐
                         │  Supabase   │
                         │             │
                         │ PostgreSQL  │
                         │ Realtime    │
                         │ Auth        │
                         │ RLS         │
                         └──────┬──────┘
                                │
                                ▼
                         questions table
                                │
                    ┌───────────┴───────────┐
                    │                       │
              Realtime Events          State Changes
                    │                       │
                    ▼                       ▼
              Moderator                  Display
```

---

# 34. Core Data Flow

The entire application can be summarized as:

```text
                  ASK
                   │
                   ▼
             SUBMIT QUESTION
                   │
                   ▼
               DATABASE
                   │
                   ▼
              MODERATION
                   │
          ┌────────┴────────┐
          │                 │
       DISMISS             SHOW
          │                 │
          ▼                 ▼
       ARCHIVE          LIVE DISPLAY
                            │
                            ▼
                          ANSWER
                            │
                            ▼
                       NEXT QUESTION
```

---

# 35. Architectural Rule

The most important rule of the project:

> **Supabase is the source of truth; the frontend is the interface to that truth.**

The student creates questions.

The moderator controls their lifecycle.

The display reflects the selected state.

Realtime connects these experiences.

Everything else should remain as simple as possible.
