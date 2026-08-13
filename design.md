# ThinkTech Q&A — Design System

> **Ask. Explore. Build.**

This document is the visual source of truth for **ThinkTech Q&A**.

The product is designed for ThinkTech Society's orientation and induction, where the interface must work across:

* Student phones
* Volunteer phones
* Moderator laptops
* Projectors
* Large orientation displays

The design direction is intentionally **minimal, monochrome, premium, and content-focused**.

---

# 1. Design Philosophy

ThinkTech Q&A should feel like a **serious technology product**, not a colorful event website or generic admin dashboard.

### Core characteristics

```text
Minimal
Monochrome
Premium
Technical
Clean
Calm
High-contrast
Content-focused
```

The interface should achieve visual quality through:

```text
Typography
Spacing
Contrast
Alignment
Subtle borders
Consistent proportions
```

rather than through visual effects.

---

# 2. Core Design Principle

> **Make it feel expensive through restraint.**

When choosing between more and less:

```text
More UI       → Less UI
More color    → Monochrome
More effects  → More whitespace
More cards    → Better hierarchy
More text     → Shorter copy
```

The interface should feel confident without trying to impress the user.

---

# 3. One Brand, Three Experiences

The three interfaces share the same visual language but have different priorities.

```text
                    THINKTECH Q&A
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
       STUDENT        MODERATOR        DISPLAY
        /ask          /moderator        /display
          │               │               │
       Mobile          Desktop         16:9 Screen
```

### Student

**Simple and immediate**

> Ask a question.

### Moderator

**Precise and functional**

> Curate the conversation.

### Display

**Large and cinematic through simplicity**

> Show the question.

---

# 4. Visual Direction

The visual target is:

```text
Apple-like restraint
+
Linear-like information hierarchy
+
Vercel-like monochrome
+
Technology-event presentation
```

Do NOT imitate any particular brand literally.

The goal is the underlying design philosophy:

* minimal interfaces
* strong typography
* monochrome palette
* deliberate spacing
* restrained interaction
* high information clarity

---

# 5. Color System

## Primary Background

```text
#09090B
```

Near-black.

Used as the primary application background.

---

## Secondary Background

```text
#111113
```

Used for:

* secondary sections
* subtle containers
* navigation surfaces

---

## Elevated Surface

```text
#18181B
```

Used sparingly for:

* cards
* inputs
* panels
* elevated controls

---

## Border

```text
#27272A
```

Default border.

---

## Strong Border

```text
#3F3F46
```

Used for:

* hover states
* active controls
* emphasized boundaries

---

## Primary Text

```text
#FAFAFA
```

Used for:

* headings
* questions
* primary actions
* important information

---

## Secondary Text

```text
#A1A1AA
```

Used for:

* descriptions
* supporting information
* metadata

---

## Muted Text

```text
#71717A
```

Used for:

* timestamps
* captions
* secondary metadata

---

## Disabled Text

```text
#52525B
```

Used for:

* disabled controls
* unavailable actions

---

# 6. Accent Policy

## There is no primary brand accent color.

**Purple and violet are intentionally removed from the design system.**

Do not use:

```text
❌ Purple
❌ Violet
❌ Neon blue
❌ Neon green
❌ Gradient accents
```

Interactive emphasis should primarily use:

```text
White
Light gray
Strong border
Contrast
Typography
```

For example:

### Primary button

```text
Background: #FAFAFA
Text: #09090B
```

### Secondary button

```text
Background: #18181B
Text: #FAFAFA
Border: #27272A
```

This keeps the interface monochrome.

---

# 7. Semantic Colors

Semantic colors are allowed only when they communicate actual state.

They should be muted and restrained.

### Success

```text
#86EFAC
```

### Warning

```text
#FCD34D
```

### Error

```text
#FCA5A5
```

### Info

```text
#93C5FD
```

Use these primarily for:

* status indicators
* validation messages
* connection states

Do not create large colorful panels around them.

---

# 8. Color Usage Rule

The majority of every interface should remain:

```text
Black
White
Gray
```

Semantic colors should occupy only a small visual percentage.

If removing a color does not reduce usability, remove it.

---

# 9. Typography

Typography is the primary visual tool.

Preferred font:

```text
Inter
```

Use the existing project font setup if already established.

Avoid adding unnecessary font dependencies.

---

# 10. Typography Hierarchy

## Display

Used primarily for `/display`.

Characteristics:

```text
Large
Bold
High contrast
Short lines
Wide breathing room
```

Example:

```text
"What exactly does
ThinkTech do?"
```

---

## H1

Large page-level heading.

Example:

```text
Ask ThinkTech Anything.
```

---

## H2

Section heading.

Example:

```text
Pending Questions
```

---

## Body

Normal interface text.

---

## Secondary

Supporting information.

---

## Caption

Small metadata such as:

```text
Just now
Anonymous Question
```

---

# 11. Typography Weight

Use:

```text
400 — Regular
500 — Medium
600 — Semibold
700 — Bold
```

Avoid excessive use of 700.

The hierarchy should primarily come from:

```text
Size
Weight
Spacing
Contrast
```

not from many different font styles.

---

# 12. Typography Rules

### Do

* Use large headings
* Keep lines short
* Use strong contrast
* Give headings room to breathe
* Keep interface copy concise

### Don't

* Use tiny body text
* Use excessive uppercase text
* Use multiple decorative fonts
* Use gradients inside typography
* Use text glow

---

# 13. Spacing System

Use a 4px-based spacing system.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px
```

Large screens should use generous whitespace.

Whitespace is an intentional part of the design.

---

# 14. Layout Principles

Every page should have:

```text
Clear hierarchy
+
Controlled width
+
Consistent margins
+
Intentional whitespace
```

Avoid filling empty space simply because it exists.

Empty space is acceptable.

---

# 15. Content Width

For normal interfaces, use a controlled maximum content width.

The student form should remain relatively narrow.

The moderator dashboard can use more horizontal space.

The display should use the entire available viewport.

Conceptually:

```text
/ask

          ┌───────────────┐
          │               │
          │    Content    │
          │               │
          └───────────────┘


/moderator

┌─────────────────────────────────────────┐
│              Content                    │
└─────────────────────────────────────────┘


/display

┌─────────────────────────────────────────┐
│                                         │
│              Full screen                │
│                                         │
└─────────────────────────────────────────┘
```

---

# 16. Border System

Default:

```text
1px solid #27272A
```

Hover:

```text
1px solid #3F3F46
```

Active:

```text
1px solid #FAFAFA
```

Do not use glowing borders.

Do not use colored borders for decoration.

---

# 17. Radius System

Use restrained rounding.

```text
Buttons     → 8px
Inputs      → 8px
Cards       → 10–12px
Containers  → 12–16px
Pills       → 9999px
```

Pills should be reserved for compact statuses.

Do not make every element pill-shaped.

---

# 18. Shadows

Shadows should be minimal.

Prefer:

```text
Surface contrast
+
Border
```

over:

```text
Large shadow
+
Glow
```

Avoid colored shadows entirely.

---

# 19. Gradients

Gradients are **not part of the primary design language**.

Default:

> No gradients.

Only use an extremely subtle background gradient if it provides meaningful depth.

Never use:

```text
Purple gradients
Rainbow gradients
Neon gradients
Text gradients
Large decorative gradients
```

---

# 20. Glassmorphism

Heavy glassmorphism is explicitly prohibited.

Do not build the interface around:

```text
Blurred glass cards
Transparent panels
Strong backdrop filters
Glow-heavy surfaces
```

A small amount of transparency may be used where technically useful, but the visual system should work without it.

---

# 21. Cards

Cards are used only when they improve information grouping.

A card should communicate:

> These pieces of information belong together.

Do not put every element inside a card.

Preferred:

```text
PENDING QUESTIONS

────────────────────────────────────

Question

metadata                     SHOW
                              DISMISS

────────────────────────────────────
```

instead of a page filled with floating boxes.

---

# 22. Buttons

## Primary

```text
Background: #FAFAFA
Text: #09090B
Radius: 8px
```

Used for:

* Submit
* Show
* Confirm
* Primary actions

---

## Secondary

```text
Background: #18181B
Text: #FAFAFA
Border: #27272A
```

Used for:

* Next
* Cancel
* Supporting actions

---

## Ghost

```text
Transparent
Text: #A1A1AA
```

Used for low-priority actions.

---

## Danger

Use restrained semantic red only when necessary.

Do not create visually aggressive red buttons for ordinary dismissal actions.

---

# 23. Button States

Every interactive button should support:

```text
Default
Hover
Focus
Active
Disabled
Loading
```

Focus must always be visible.

Example:

```text
Default
→ subtle border

Hover
→ lighter surface

Focus
→ clear white focus ring

Active
→ slightly darker surface

Disabled
→ reduced contrast

Loading
→ spinner / text transition
```

---

# 24. Inputs

Inputs should be quiet and functional.

Example:

```text
┌────────────────────────────────────┐
│ What's on your mind?               │
│                                    │
│                                    │
└────────────────────────────────────┘
```

Use:

```text
Background: #111113 / #18181B
Border: #27272A
Text: #FAFAFA
Placeholder: #71717A
```

Focus:

```text
Border: #FAFAFA
```

No purple focus rings.

---

# 25. Status Badges

Statuses:

```text
Pending
Displayed
Answered
Dismissed
Live
Reconnecting
Offline
```

Use compact badges.

Example:

```text
● LIVE
```

The visual distinction should come from:

```text
Text
Icon
Subtle semantic color
```

not color alone.

---

# 26. `/ask` — Student Experience

The student interface is intentionally the simplest interface.

Primary objective:

> Submit a question in a few seconds.

Layout:

```text
                THINKTECH
                 SOCIETY


            ASK THINKTECH
               ANYTHING

        Your question is anonymous.


        ┌──────────────────────────┐
        │ What's on your mind?     │
        │                          │
        │                          │
        │                          │
        └──────────────────────────┘

                    0 / 500

             [ Submit Question ]

          No name. No login.
          Just your question.
```

---

# 27. Student Priorities

Priority order:

```text
1. Question input
2. Submit action
3. Anonymous reassurance
4. Branding
```

Nothing should compete with the question field.

No unnecessary navigation.

No sidebar.

No dashboard.

No decorative graphics.

---

# 28. Student Success State

Minimal success state:

```text
                ✓

        Question submitted.

      Your question has been received
      and will be reviewed by ThinkTech.

          [ Ask another question ]
```

The success state should feel reassuring, not celebratory.

---

# 29. `/moderator` — Moderator Experience

The moderator interface should feel like a **quiet control room**.

The moderator needs to understand:

```text
What is waiting?
What is displayed?
What should I do?
```

Recommended hierarchy:

```text
THINKTECH Q&A                         ● LIVE

24 Total     8 Pending     1 Displayed     15 Answered

CURRENTLY DISPLAYED

"What exactly does ThinkTech do?"

Anonymous Question

[ Mark as Answered ]   [ Next ]


PENDING QUESTIONS

────────────────────────────────────────────

Can first-year students join ThinkTech?

Just now                     SHOW   DISMISS

────────────────────────────────────────────

What projects does ThinkTech build?

Just now                     SHOW   DISMISS
```

Use dividers and whitespace rather than excessive cards.

---

# 30. Moderator Priorities

```text
1. Pending questions
2. Current displayed question
3. Moderation actions
4. Statistics
5. Secondary information
```

The `SHOW` action should be immediately discoverable.

---

# 31. Moderator Statistics

Avoid colorful statistic cards.

Prefer:

```text
24
Total Questions

8
Pending

1
Displayed

15
Answered
```

or a compact horizontal arrangement.

Typography should create hierarchy.

---

# 32. `/display` — Audience Experience

This is the most minimalist interface.

The display exists to make one thing clear:

> **What question is currently being discussed?**

Recommended hierarchy:

```text
THINKTECH
LIVE Q&A


"What exactly does
ThinkTech do?"


Anonymous Question


                         ┌─────────┐
                         │         │
                         │   QR    │
                         │         │
                         └─────────┘

                         Scan to ask
```

---

# 33. Display Rules

The display must prioritize:

```text
Question
   ↓
Anonymous indicator
   ↓
QR instruction
   ↓
Branding
```

Remove:

* Navigation
* Moderator controls
* Statistics
* Dense metadata
* Decorative graphics

---

# 34. Display Typography

The question should occupy the majority of the visual attention.

Use:

* Very large type
* Strong weight
* Short line length
* High contrast
* Generous spacing

The audience should understand the question from several meters away.

---

# 35. Display Waiting State

Minimal:

```text
THINKTECH
LIVE Q&A


Waiting for the next question...


Scan to ask
```

No large spinner.

No colorful loading animation.

The empty state should feel intentional.

---

# 36. QR Code

The final QR code should follow the monochrome system.

Preferred:

```text
Black QR
White background
```

or:

```text
White QR
Black background
```

Maintain generous whitespace around the QR.

Copy:

> **Scan to ask anonymously**

The actual QR implementation is a functionality concern and should follow the architecture defined elsewhere.

---

# 37. Animation

Animation should be subtle and functional.

Allowed:

```text
Fade
Small slide
Opacity transition
Button hover
```

Avoid:

```text
Bounces
Large scaling
Continuous motion
Floating decorations
Glow animations
Neon effects
```

Animations should never interfere with the live event.

Respect:

```text
prefers-reduced-motion
```

---

# 38. Iconography

Use simple line icons only where they improve understanding.

Good uses:

```text
Check
Close
Arrow
Live indicator
QR
```

Avoid decorative icon collections.

Icons should support the interface, not compete with content.

---

# 39. Responsive Design

## `/ask`

Priority:

```text
320px
375px
390px
430px
768px
1024px
1440px
```

Mobile is the primary target.

---

## `/moderator`

Priority:

```text
768px
1024px
1280px
1440px
```

Desktop is the primary target.

---

## `/display`

Primary target:

```text
1920 × 1080
16:9
```

The design must also scale gracefully to other 16:9 displays.

---

# 40. Accessibility

All interfaces must support:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Proper labels
* Accessible buttons
* Accessible form errors
* Sufficient contrast
* Reduced-motion support

Never communicate status through color alone.

---

# 41. Content Rules

Keep interface copy short.

Prefer:

> Ask ThinkTech Anything.

over:

> Welcome to the official ThinkTech Society Anonymous Interactive Question and Answer Platform.

Prefer:

> Your question is anonymous.

over:

> Your submitted question will not require personal identifying information.

Short copy is part of the design.

---

# 42. Component Architecture

Reusable components should live under:

```text
src/components/
```

Suggested structure:

```text
components/
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── textarea.tsx
│
├── ask/
├── moderator/
└── display/
```

Do not abstract unnecessarily.

---

# 43. Design Tokens

Centralize reusable values where practical:

```text
Colors
Typography
Spacing
Radius
Borders
Transitions
```

Avoid scattering magic values throughout components.

---

# 44. Visual Density

The product should intentionally have **low visual density**.

Use:

```text
More whitespace
Less decoration
Fewer borders
Fewer cards
Shorter copy
Clearer hierarchy
```

A page does not need to fill every available pixel.

---

# 45. Things Explicitly Prohibited

```text
❌ Purple
❌ Violet
❌ Neon colors
❌ Cyberpunk styling
❌ Heavy gradients
❌ Gradient text
❌ Excessive glassmorphism
❌ Glowing borders
❌ Colored shadows
❌ Excessive cards
❌ Excessive rounded pills
❌ Decorative animations
❌ Giant illustrations
❌ Visual clutter
```

---

# 46. Quality Standard

The UI should look polished because of:

```text
Precise spacing
Strong typography
Consistent alignment
Good proportions
Clear hierarchy
Restrained color
```

Not because of:

```text
Effects
Gradients
Glows
Animations
Decoration
```

---

# 47. Design Decision Rule

When implementing any new component, ask:

### Does it improve comprehension?

If no:

> Remove it.

### Does it need color?

If no:

> Use monochrome.

### Does it need a card?

If no:

> Use whitespace and typography.

### Does it need animation?

If no:

> Keep it static.

### Does it need another button?

If no:

> Don't add one.

---

# 48. Final Visual Target

The overall product should feel like:

```text
                         THINKTECH


                           Q&A


                    ───────────────


                  Clear typography


                  Generous whitespace


                    Black / White


                   Subtle borders


                   Minimal controls


                  No visual noise
```

The product should feel **quiet, precise, and confident**.

---

# 49. Final Principle

> **The interface should disappear behind the interaction.**

The student should think:

> “I have a question.”

The moderator should think:

> “Which question should I show?”

The audience should think:

> “That's the question.”

Everything else is secondary.

---

# 50. Absolute Rule

**Black + White + Gray + Typography + Space.**

No purple.

No neon.

No unnecessary effects.

The **question is the hero**.
