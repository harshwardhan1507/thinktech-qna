# ThinkTech Q&A — Product Requirements Document

**Product:** ThinkTech Q&A
**Organization:** ThinkTech Society
**Version:** 1.0
**Status:** Development
**Primary Event:** ThinkTech Society Orientation / Induction
**Last Updated:** August 2026

---

# 1. Product Overview

**ThinkTech Q&A** is an anonymous, real-time question-and-answer platform designed for the ThinkTech Society's orientation and induction.

The system allows students to ask questions without revealing their identity.

Students can submit questions through:

1. A **volunteer-provided mobile phone**
2. A **QR code** displayed on the main orientation screen

Questions are sent to a moderation queue.

A volunteer/moderator reviews the questions and decides which ones should be displayed publicly.

The selected question is then shown in real time on the main orientation screen.

---

# 2. Problem Statement

Traditional society inductions are mostly one-directional:

```text
Seniors / Society
        ↓
Presentation
        ↓
Students
```

Students may have questions but hesitate to ask them publicly because of:

* Shyness
* Fear of judgment
* Uncertainty about whether the question is appropriate
* Large audience
* Lack of opportunity during the presentation

ThinkTech Q&A introduces an anonymous and moderated interaction layer:

```text
Student
   ↓
Anonymous Question
   ↓
Moderation
   ↓
Audience Display
   ↓
Discussion / Answer
```

This makes the induction more interactive while allowing ThinkTech volunteers to retain control over the conversation.

---

# 3. Product Vision

Create a simple system that makes students feel comfortable asking questions while giving ThinkTech volunteers complete control over what appears on the orientation screen.

The ideal experience should feel:

> **Fast. Anonymous. Interactive. Controlled.**

---

# 4. Goals

## Primary Goals

### G1 — Anonymous Participation

Allow students to ask questions without creating an account or providing identifying information.

### G2 — Interactive Orientation

Turn the induction into a two-way conversation rather than a passive presentation.

### G3 — Human Moderation

Allow volunteers to review every question before it reaches the audience.

### G4 — Real-Time Display

Allow approved questions to appear on the main screen without requiring a page refresh.

### G5 — Simple Student Experience

A student should be able to submit a question in only a few seconds.

### G6 — Event Reliability

The system must be simple and reliable enough to operate during a live orientation.

---

# 5. Non-Goals

The initial product is NOT intended to be:

* A general-purpose social network
* A public discussion forum
* A permanent student feedback platform
* A chat application
* A full learning-management system
* An AI chatbot
* A replacement for live interaction
* A multi-organization SaaS product

The primary use case is:

> **ThinkTech Society orientation / induction Q&A.**

---

# 6. Target Users

## 6.1 Student

A student attending the ThinkTech orientation.

Characteristics:

* May be unfamiliar with ThinkTech
* May be hesitant to ask questions publicly
* Usually interacts using a mobile phone
* Needs an extremely simple interface
* Does not need an account

Primary goal:

> Submit a question anonymously.

---

## 6.2 Volunteer

A ThinkTech volunteer who interacts with students and/or manages the Q&A system.

Responsibilities may include:

* Giving a phone to students
* Helping students submit questions
* Monitoring incoming questions
* Moderating questions

Primary goal:

> Keep questions flowing into the system.

---

## 6.3 Moderator

A volunteer responsible for controlling what appears on the main screen.

Primary goals:

* Review questions
* Select appropriate questions
* Dismiss inappropriate questions
* Control the current displayed question
* Move through questions during the session

---

## 6.4 Audience

Students watching the orientation presentation.

They primarily interact with:

* The live question display
* QR code
* Questions selected by moderators

Primary goal:

> See the question currently being discussed.

---

# 7. User Experience

## 7.1 Student Flow — Volunteer Phone

```text
Volunteer approaches student
        ↓
Volunteer asks:
"Do you have a question?"
        ↓
Volunteer hands over phone
        ↓
Student opens /ask
        ↓
Student types question
        ↓
Student presses Submit
        ↓
Confirmation appears
        ↓
Student returns phone
```

---

# 8. Student Flow — QR Code

Students may alternatively use their own devices.

```text
Orientation Display
        ↓
QR Code visible
        ↓
Student scans QR
        ↓
/ask opens
        ↓
Student types question
        ↓
Submit
        ↓
Question enters moderation queue
```

Both methods must lead to exactly the same student experience.

---

# 9. Moderator Flow

```text
Question submitted
        ↓
Moderator receives question
        ↓
Question appears in Pending
        ↓
Moderator reviews
        │
        ├──────────────┐
        │              │
      SHOW          DISMISS
        │              │
        ▼              ▼
    Displayed       Dismissed
        │
        ▼
     Answered
        │
        ▼
    Next Question
```

---

# 10. Core Features

# F01 — Anonymous Question Submission

Students must be able to submit questions without authentication.

### Requirements

* Text input
* Submit button
* Character limit
* Validation
* Loading state
* Success state
* Error state

### Constraints

Minimum:

```text
3 characters
```

Maximum:

```text
500 characters
```

Questions should be trimmed before submission.

---

# F02 — Anonymous UX

The student interface must not require:

* Name
* Email
* Student ID
* Password
* Account

The interface should clearly communicate:

> **Your question is anonymous.**

---

# F03 — Question Queue

Every submitted question enters:

```text
PENDING
```

The moderator should be able to see pending questions.

Each question should show:

* Question content
* Submission time
* Current status
* Available actions

---

# F04 — Question Moderation

The moderator must be able to:

### Show

Move:

```text
pending → displayed
```

### Dismiss

Move:

```text
pending → dismissed
```

### Answer

Move:

```text
displayed → answered
```

### Next

Move away from the current question and select another appropriate question.

---

# F05 — Live Display

The `/display` page is designed for the orientation projector / large screen.

It should display:

* ThinkTech branding
* Current question
* Anonymous indicator
* QR code
* Ask instructions

The question must be highly readable from a distance.

---

# F06 — Real-Time Synchronization

The system must synchronize question state in real time.

Example:

```text
Moderator clicks SHOW
        ↓
Database updates
        ↓
Realtime event
        ↓
Display updates
```

No manual refresh should be required.

---

# F07 — QR Code

A QR code should provide direct access to:

```text
/ask
```

The QR should be displayed prominently on the main screen.

The QR destination must be configurable through:

```text
NEXT_PUBLIC_APP_URL
```

Do not hardcode the production domain.

---

# F08 — Moderator Statistics

The moderator dashboard should show:

```text
Total Questions
Pending
Displayed
Answered
Dismissed
```

These statistics are intended for operational awareness rather than advanced analytics.

---

# F09 — Connection Status

The moderator and display interfaces should communicate realtime connectivity.

Possible states:

```text
LIVE
RECONNECTING
OFFLINE
```

The audience-facing display should keep technical messaging subtle.

---

# F10 — Error Handling

The application must handle:

* Failed question submission
* Database errors
* Realtime disconnects
* Network failures
* Invalid input
* Empty states

User-facing errors should be understandable.

Do not expose raw database errors.

---

# 11. Question States

The system supports four primary states:

```text
PENDING
DISPLAYED
ANSWERED
DISMISSED
```

State diagram:

```text
              ┌─────────────┐
              │   PENDING   │
              └──────┬──────┘
                     │
             ┌───────┴───────┐
             │               │
             ▼               ▼
       ┌───────────┐   ┌─────────────┐
       │ DISPLAYED │   │  DISMISSED  │
       └─────┬─────┘   └─────────────┘
             │
             ▼
       ┌───────────┐
       │ ANSWERED  │
       └───────────┘
```

---

# 12. Functional Requirements

## FR-01

The system must allow anonymous question submission.

## FR-02

The system must validate question length.

## FR-03

The system must persist submitted questions.

## FR-04

New questions must appear in the moderator queue.

## FR-05

The moderator must be able to display a pending question.

## FR-06

The moderator must be able to dismiss a pending question.

## FR-07

The moderator must be able to mark a displayed question as answered.

## FR-08

The display must show the currently selected question.

## FR-09

Changes to displayed questions must propagate without manual refresh.

## FR-10

The display must provide QR access to `/ask`.

## FR-11

The moderator must be able to see basic question counts.

## FR-12

The application must remain usable on mobile, desktop, and 16:9 displays.

---

# 13. Non-Functional Requirements

## Performance

Student submission should feel immediate.

Target:

```text
< 2 seconds
```

for normal submission under a healthy network connection.

---

## Availability

The system should remain operational throughout the orientation session.

The application should gracefully handle temporary network interruptions.

---

## Responsiveness

Student UI:

```text
Mobile-first
```

Moderator UI:

```text
Desktop-first
```

Display:

```text
16:9-first
```

---

## Accessibility

The application should provide:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Accessible form controls
* Adequate contrast
* Meaningful button labels

---

# 14. Privacy Requirements

The system should minimize data collection.

Do not intentionally collect:

```text
Name
Email
Student ID
Phone number
```

The minimum question record should contain:

```text
Question content
Timestamp
Status
```

Anonymous participation is a core product requirement.

---

# 15. Security Requirements

Moderator functionality must not be publicly writable.

Eventually:

```text
Student
→ Create question

Moderator
→ Read / modify questions

Display
→ Read appropriate public state
```

Use:

* Supabase Authentication
* Row Level Security
* Proper authorization

Do not rely on hidden routes or frontend-only access checks.

---

# 16. Technology Requirements

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

## Backend / Infrastructure

```text
Supabase
PostgreSQL
Supabase Realtime
Supabase Auth
```

## Deployment

```text
Vercel
```

## Repository

```text
thinktech-qna
```

---

# 17. MVP Scope

The MVP consists of:

```text
✓ Student question submission
✓ Anonymous participation
✓ Moderator queue
✓ Show / dismiss
✓ Mark answered
✓ Live display
✓ Realtime synchronization
✓ QR access
✓ Basic statistics
✓ Responsive UI
✓ Moderator authentication
```

Everything else is secondary.

---

# 18. Future Features

Potential future improvements:

### Community Interaction

* Question upvotes
* Audience reactions
* Popular-question ranking

### Moderation

* Automatic profanity filtering
* AI-assisted moderation
* Duplicate-question detection

### Organization

* Question categories
* Tags
* Search
* Filters

### Analytics

* Total questions
* Questions per minute
* Popular categories
* Most common topics
* Event reports

### Event Management

* Multiple events
* Event-specific rooms
* Event history
* Custom branding

### Accessibility

* Text-to-speech
* Larger display modes
* High-contrast mode

These are explicitly outside the initial MVP unless prioritized later.

---

# 19. Success Criteria

The product is successful if a real orientation can run the following workflow without friction:

```text
1. Student receives / scans access
          ↓
2. Student submits anonymous question
          ↓
3. Question appears in moderator queue
          ↓
4. Moderator reviews it
          ↓
5. Moderator clicks SHOW
          ↓
6. Question appears on projector
          ↓
7. Question is answered
          ↓
8. Moderator moves to next question
```

The entire process should require **no page refresh**.

---

# 20. Event-Day Acceptance Test

Before deployment, perform a complete simulation.

### Student

* [ ] Open `/ask` on a phone
* [ ] Submit a question
* [ ] Verify success message
* [ ] Verify anonymous UX

### Moderator

* [ ] Open `/moderator`
* [ ] See incoming question
* [ ] Show question
* [ ] Dismiss question
* [ ] Mark question answered
* [ ] Move to next question

### Display

* [ ] Open `/display`
* [ ] Verify question appears
* [ ] Verify question changes without refresh
* [ ] Verify QR code works
* [ ] Verify readability from a distance

### Reliability

* [ ] Test temporary network failure
* [ ] Test reconnect
* [ ] Test multiple questions
* [ ] Test rapid submissions
* [ ] Test invalid submissions

---

# 21. Product Constraints

The project should remain intentionally small.

Do not introduce:

* Microservices
* Custom WebSocket infrastructure
* Redis
* Kubernetes
* Native mobile applications
* Complex global state management
* Separate backend server

unless future requirements make them necessary.

The preferred architecture is:

```text
Next.js
    +
Supabase
    +
Vercel
```

---

# 22. Product Principles

### Principle 1 — Anonymous by Default

Students should never feel that their question is tied to their identity.

### Principle 2 — Moderator in Control

Nothing reaches the main screen without moderation.

### Principle 3 — Realtime by Design

The experience should feel live.

### Principle 4 — Simplicity Over Features

A reliable five-feature system is better than a fragile twenty-feature system.

### Principle 5 — Event First

Every product decision should consider the realities of a live orientation.

### Principle 6 — The Question Is the Hero

The interface should make the student's question the center of the experience.

---

# 23. Final Product Flow

```text
                       THINKTECH ORIENTATION
                                │
                                ▼
                       STUDENT GETS ACCESS
                          /            \
                         /              \
                VOLUNTEER PHONE        QR CODE
                         \              /
                          \            /
                           ▼          ▼
                              /ask
                                │
                                ▼
                     ANONYMOUS QUESTION
                                │
                                ▼
                            SUPABASE
                                │
                                ▼
                       MODERATOR QUEUE
                                │
                    ┌───────────┴───────────┐
                    │                       │
                 DISMISS                   SHOW
                    │                       │
                    ▼                       ▼
                DISMISSED                DISPLAY
                                            │
                                            ▼
                                      ORIENTATION
                                         SCREEN
                                            │
                                            ▼
                                          ANSWER
                                            │
                                            ▼
                                      NEXT QUESTION
```

---

# 24. Product Definition

ThinkTech Q&A is ultimately a **moderated anonymous conversation layer for ThinkTech Society's orientation**.

Its job is not to replace the presentation.

Its job is to make the presentation interactive.

The ideal experience is:

> **Student asks. ThinkTech listens. Everyone learns.**

---

# 25. Release Definition

Version 1.0 is ready for the ThinkTech orientation when:

* All MVP features work
* Realtime synchronization is reliable
* Moderator controls are protected
* Anonymous submission works
* QR access works
* Display works on the intended projector/screen
* The complete event flow has been tested
* Production deployment is stable
* No critical errors remain

**Primary objective:**

> Make the ThinkTech induction feel like a conversation, not a presentation.
