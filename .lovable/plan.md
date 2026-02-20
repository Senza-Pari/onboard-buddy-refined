
# Updated Demo Plan: Isolated Guest Sessions + Mobile-First Design

## Two New Priorities Added to the Plan

Your two questions expose real gaps in the original plan. Here's how they change everything:

---

## Problem 1: Guest Data Isolation — "One Person Shouldn't Break It For Everyone"

### The Root Cause

All Zustand stores currently use `persist()` with `localStorage`. This means every visitor to the same browser shares the same data. If Person A checks off all the tasks, Person B opens the same browser tab (or if you demo it on a shared device) and sees a completed checklist. Worse, if someone deletes everything, it's gone for the next visitor on that device.

### The Solution: Session-Scoped Demo Data (No Persistence)

Instead of relying on localStorage for guest users, we change the approach entirely:

**For guests, data lives only in memory for that browser session.**

Here is how this works technically:

- When `loginAsGuest()` is called, we set a flag `isGuestMode: true` in the auth store
- A new `useDemoStore` holds all guest data (tasks, gallery items) **without** the `persist()` middleware — it exists only in RAM
- The existing persisted stores (`taskStore`, `galleryStore`) are used only for real logged-in users
- When a guest closes the tab or navigates away, their session data disappears naturally
- Every new guest session starts fresh from the same canonical demo dataset

This means:
- Guest A and Guest B each get their own isolated, identical starting point
- Guest A completing a task has zero effect on Guest B
- A refresh resets back to the clean demo state (which is actually a feature — it encourages re-exploring)
- Real users (when you later enable signup) have their data persisted normally

### What This Looks Like in Code

```text
src/stores/demoStore.ts       — NEW: in-memory only store with all demo data
src/stores/taskStore.ts       — Modified: reads from demoStore when isGuestMode=true  
src/stores/galleryStore.ts    — Modified: reads from demoStore when isGuestMode=true
src/hooks/useAppStore.ts      — NEW: a unified hook that returns the right store
                                based on whether the user is a guest or real user
```

The pages themselves (`TaskList`, `Gallery`, etc.) call `useAppStore()` instead of the raw stores, so they automatically get the right data source without any per-page changes needed.

---

## Problem 2: Mobile-First Design

### Current Mobile State

Looking at the code, the app has basic mobile support but it is not mobile-first:
- Sidebar collapses behind a hamburger menu (good)
- But the hamburger button (`fixed top-4 left-4`) overlaps content and is small (44px tap target — barely acceptable)
- Main content has `pt-12 md:pt-0` to dodge the hamburger, which is a hack
- No bottom navigation bar (this is the standard mobile pattern for apps)
- Task cards have small edit/delete buttons that are hard to tap on mobile
- Gallery grid goes `sm:grid-cols-2` — fine, but form inputs and buttons need larger tap targets
- The `input-field` class uses `py-3` padding — acceptable but not great on mobile
- No consideration for one-handed use (bottom of screen is thumb territory)

### The Solution: Mobile Navigation Bar + Touch-First Layouts

**Replace the top hamburger with a bottom navigation bar on mobile.** This is the pattern every modern mobile app uses (think: Instagram, Twitter, Notion mobile). The sidebar stays for desktop.

```text
Mobile (< 768px):            Desktop (>= 768px):
┌─────────────────────┐      ┌──────────┬────────────────────┐
│ [  Main Content   ] │      │          │                    │
│                     │      │ Sidebar  │   Main Content     │
│                     │      │          │                    │
├─────────────────────┤      └──────────┴────────────────────┘
│ 🏠  ✅  🏆  👤  📷 │
└─────────────────────┘
```

The bottom nav shows the 5 most important sections. Templates and Export move to a "More" option or stay accessible via sidebar on tablet+.

**Touch Target Sizes**: All interactive elements get `min-h-[44px] min-w-[44px]` — Apple's HIG and Google's Material Design both require this as the minimum for comfortable tapping.

**Safe Area Handling**: Modern phones have home indicator bars and notches. We add `padding-bottom: env(safe-area-inset-bottom)` to the bottom nav so it doesn't sit behind the home indicator on iPhones.

---

## Complete Updated File Plan

### New Files

| File | Purpose |
|------|---------|
| `src/stores/demoStore.ts` | In-memory Zustand store (no persist) holding canonical demo data. Resets on page refresh automatically. |
| `src/hooks/useAppData.ts` | Unified hook: returns demo store data for guests, real store data for authenticated users |
| `src/components/BottomNav.tsx` | Mobile bottom navigation bar with 5 icons, active state highlighting, and safe-area padding |
| `src/data/demoData.ts` | The canonical demo dataset: 10 tasks, 6 gallery items pre-tagged to unlock mission progress |
| `src/components/DemoTour.tsx` | Guided tour overlay (from original plan, unchanged) |
| `src/data/demoTourSteps.ts` | Tour step config (from original plan) |
| `src/stores/demoTourStore.ts` | Tour state manager — not persisted, resets each session |

### Modified Files

| File | Change |
|------|--------|
| `src/stores/authStore.ts` | Add `isGuestMode` flag; `loginAsGuest()` seeds demoStore and starts tour |
| `src/layouts/AppLayout.tsx` | Add `<BottomNav />` for mobile; remove hamburger button hack; keep sidebar for desktop only |
| `src/pages/TaskList.tsx` | Use `useAppData` hook; increase tap target sizes on task toggle and action buttons |
| `src/pages/Gallery.tsx` | Use `useAppData` hook; larger buttons on mobile; stack form vertically on small screens |
| `src/pages/Dashboard.tsx` | Use `useAppData` hook; make cards full-width and tappable on mobile |
| `src/pages/Welcome.tsx` | Update "Explore as Guest" button copy; add mobile-optimized hero layout |
| `src/index.css` | Add mobile-specific utility classes: safe-area padding, larger tap targets |

---

## The Demo Dataset (What Every Guest Sees)

**Guest persona**: Alex Rivera, Day 3 at Acme Corp (start date = 3 days ago, so Day 3 of 14 shows on Dashboard)

### Tasks (10 total, mix of complete/pending to show real progress):

```text
Completed (3):
- Submit I-9 documentation [HR, admin] — completed
- Set up workstation [IT, setup, equipment] — completed  
- Meet with manager [Manager, team, meetings] — completed

Pending (7):
- Complete W-4 tax forms [HR, admin]
- Configure email and Slack [IT, setup]
- Complete security awareness training [IT]
- Schedule 1:1s with teammates [Manager, team]
- Review employee handbook [HR]
- Access code repositories [IT]
- Complete benefits enrollment [HR]
```

30% task completion = realistic "in progress" feeling, not overwhelming, not empty.

### Gallery Items (6 pre-seeded notes, tagged to unlock missions):

```text
"First Day Reflections" — tags: hr, admin
"Team Standup Notes" — tags: team, meetings
"Workstation All Set!" — tags: setup, equipment
"Company Values & Culture" — tags: admin, hr
"Engineering Team Sync" — tags: team, meetings
"Benefits Overview Notes" — tags: hr
```

These tags map directly to the 3 missions' requirements, so all missions show partial progress (not 0%) when the demo loads.

### Mission Progress After Seeding:
- "Complete Onboarding Basics" (needs admin×2, hr×2): admin=3✓, hr=4✓ → **100% — COMPLETED**
- "Team Connection" (needs team×3, meetings×2): team=2, meetings=2 → **~80% in progress**
- "Workspace Setup" (needs setup×2, equipment×1): setup=2✓, equipment=1✓ → **100% — COMPLETED**

This means the Dashboard Mission Progress card shows ~93% average — impressive and engaging.

---

## Mobile Navigation Details

The `BottomNav` component:

```text
[ 🏠 Home ][ ✅ Tasks ][ 🏆 Missions ][ 👤 People ][ 📷 Gallery ]
```

- Fixed to bottom of screen on mobile only (`md:hidden`)
- Active item gets primary color highlight
- Each item has a label below the icon
- Minimum tap target: 44px height
- Adds `pb-16` padding to main content on mobile so content doesn't hide behind the nav bar
- Includes `padding-bottom: env(safe-area-inset-bottom)` for iPhone notch/home indicator

The old hamburger + slide-out sidebar remains on tablet (768px+) and desktop, unchanged.

---

## Tour Flow (Updated for Mobile)

The guided tour from the original plan works the same, but on mobile the tooltip becomes a **bottom sheet** instead of a floating tooltip. Bottom sheets are the standard mobile pattern for contextual information — they slide up from the bottom and are easy to dismiss with a swipe.

- Desktop: floating tooltip card adjacent to spotlight element
- Mobile: bottom sheet (fixed, slides up from bottom, 60% screen height max)
- Both: animated with Framer Motion, same step content

---

## Sequence of Implementation

1. Create `demoData.ts` with the full dataset
2. Create `demoStore.ts` (in-memory, no persist)
3. Update `authStore.ts` `loginAsGuest()` to seed demoStore
4. Create `useAppData.ts` hook
5. Create `BottomNav.tsx` component
6. Update `AppLayout.tsx` to include BottomNav and remove hamburger hack
7. Update `TaskList.tsx`, `Gallery.tsx`, `Dashboard.tsx` to use `useAppData`
8. Create `DemoTour.tsx` + `demoTourSteps.ts` + `demoTourStore.ts`
9. Polish mobile tap targets and safe-area padding

No database changes. No new npm dependencies. Framer Motion (already installed) handles all animations.
