
# The Full Roadmap: What We Can Build Next

This is a strategic, prioritized feature roadmap organized by impact tier. Each item is self-contained and can be built one or a few at a time.

## The Current State (What We Have)
- Welcome splash → demo tour → full app
- Tasks (sorted, quick-add, journal prompt on complete)
- Missions (tag-based progress tracking)
- People / Meet & Greet tracker
- Journal / Gallery (notes + photos)
- Buddy AI chat (Gemini, streaming, TTS, 10-msg guest cap)
- PDF export
- Settings panel, bottom nav, demo tour

---

## Tier 1: High-Impact Polish (Biggest bang, quickest wins)

### 1A. Real-time Daily Greeting on Dashboard
Replace "Welcome back!" with a personalized, AI-generated 1-sentence greeting each morning based on the user's name, day number, and next due task. Cached so it only calls AI once per day.

### 1B. Overdue Task Warnings
Tasks past their due date get a red `Overdue` badge and float above even regular incomplete tasks. A subtle shake animation on the badge adds urgency. No more missing deadlines silently.

### 1C. Progress Celebration Moments
When overall task progress hits 25%, 50%, 75%, and 100% — a full-screen confetti moment fires with a personalized message ("Halfway through Week 1 — you're crushing it, Alex!"). Currently only individual task completions celebrate.

### 1D. Smart Dashboard "What To Do Now" Card
A single card at the very top of Dashboard: "Your next priority" — shows the single most urgent incomplete task with a one-tap complete button. No scrolling required.

### 1E. Onboarding Day Counter as a Hero Element
Replace the plain "Day X of 14" text with a visual timeline at the top of the Dashboard — a horizontal progress strip with labeled milestones (Day 1, Week 1, Week 2, Done).

---

## Tier 2: Connectivity & Sharing

### 2A. Share Your Journey (Public Snapshot)
Generate a beautiful read-only shareable page (e.g., `/share/abc123`) that shows a new hire's progress — tasks completed, missions earned, people met. A "Share with manager" button creates the link. Great for weekly check-ins.

### 2B. Manager View / Admin Dashboard
A separate route (`/admin`) that shows all employees and their progress in a grid — who's on track, who needs help. Requires a `managers` role in the database. This unlocks the B2B/enterprise use case.

### 2C. Slack/Email Digest (Daily Check-in)
Connect to Slack (connector already available). Send the new hire a daily morning message: "Good morning Alex! You have 2 tasks due today. Ask Buddy anything..." with deep links back to the app.

### 2D. Invite a Buddy / Mentor
Allow assigning a peer buddy — enter their email, they get an invite link, and they see a simplified read-only view of the new hire's progress with a chat channel between them.

---

## Tier 3: AI Power-Ups

### 3A. AI Task Suggestions
On the Tasks page, a "Suggest tasks for me" button calls the AI with the user's company name and role, and returns 5–8 role-specific onboarding tasks pre-populated with tags, departments, and due dates.

### 3B. Buddy Proactive Nudges
Instead of only responding, Buddy sends a proactive notification when:
- A task is overdue (> 1 day past due)
- The user hasn't logged in for 2 days
- A mission is nearly complete (e.g., 1 more journal entry needed)

### 3C. Journal Entry AI Summary
On the Export page, add an "AI Summary" button that calls the AI to write a 3-paragraph narrative of the new hire's onboarding journey based on their journal entries and completed tasks. This is copy-pasteable into a LinkedIn post or manager report.

### 3D. Voice-First Buddy (ElevenLabs Conversational Agent)
Upgrade from text-only + TTS to a full voice conversation using the ElevenLabs conversational AI agent (SDK already installed). User taps a mic button, speaks, Buddy responds in voice. Better for mobile-first users.

---

## Tier 4: Product Depth

### 4A. Streak Tracking
Track daily login streaks. "Day 5 streak 🔥" shown on the Dashboard header. Small gamification element that drives re-engagement.

### 4B. Mission Badge Gallery
A visual badge wall on the Dashboard or a dedicated `/badges` page showing earned badges with unlock dates. Empty badge slots show locked missions as aspirational goals.

### 4C. Onboarding Template Marketplace
Templates page currently exists but is basic. Build a curated gallery of role-specific templates (Software Engineer, Sales Rep, Operations, etc.) that HR can one-click apply to a new hire.

### 4D. Calendar Integration
Show task due dates on a mini calendar widget on the Dashboard. Add `.ics` file download so tasks can be added to Google Calendar / Outlook.

### 4E. Photo Journal Moments (Day-in-the-life)
Upgrade the Journal section with a "Today's highlight" prompt that appears once per day — a single tap to add a photo + caption. Creates an automatic day-by-day visual record of the first 2 weeks.

---

## Suggested First Wave (3-5 sessions)

Based on impact-per-effort and demo wow factor, I'd recommend building in this order:

1. **1D** — "What To Do Now" card (5 min, huge UX win)
2. **1B** — Overdue task warnings (10 min)
3. **3A** — AI task suggestions (30 min, killer demo moment)
4. **2A** — Share journey link (45 min)
5. **1C** — Milestone celebrations (20 min)

Each can be a standalone conversation. Just say "let's build [item]" and we go.

## Technical Notes
- All AI features use the existing Lovable AI Gateway + `onboarding-buddy` edge function (no new API keys)
- Sharing requires a new `shared_snapshots` table + public route (no auth required)
- Manager view requires a `user_roles` table in the database
- Slack integration uses the existing Slack connector (already in the connector catalog)
- Voice Buddy requires no new API keys (ElevenLabs key already configured)
