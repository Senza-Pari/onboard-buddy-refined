

# Fix Demo Tour: Interactive Steps, Always-Available Restart, and Celebration Feedback

## Issues Found

1. **Tour overlay blocks interaction**: The `bg-black/50 pointer-events-auto` overlay covers the entire screen, preventing users from actually tapping tasks even though the hint says "Try checking off a task right now!" Clicking anywhere on the overlay calls `skip()`, which kills the tour entirely.

2. **No way to restart the tour**: Once the tour is skipped or completed, there is no UI to re-launch it. A user who arrived via a bookmark or who dismissed it early has no way back.

3. **No celebration/feedback when completing a task**: Checking off a task has no visual reward — just a green checkmark swap. For a demo experience, this is a missed opportunity for delight.

---

## Solution

### 1. Make the tour non-blocking on interactive steps

Change `DemoTour.tsx` so that on steps with an `actionHint` (currently step 2 — Tasks), the dark overlay is removed and the tour card floats as a non-blocking bottom sheet / floating card. This lets users actually interact with the page content underneath.

- Add an `interactive` boolean field to the `TourStep` interface in `demoTourSteps.ts`
- When `step.interactive === true`, skip the full-screen overlay and instead render only the tooltip card (positioned at top on mobile, or top-right on desktop) with a subtle semi-transparent backdrop that does NOT capture pointer events
- The tour card stays visible while the user interacts with the page

### 2. Add a "Restart Tour" button accessible anytime

Add a small floating help/tour button visible to guest users at all times:

- In `AppLayout.tsx`, render a small floating action button (FAB) in the bottom-right corner (above the bottom nav on mobile) when the user is a guest AND the tour is not currently active
- Icon: a `HelpCircle` or `Sparkles` icon with a tooltip "Replay Tour"
- Tapping it calls `demoTourStore.start()` and also calls `demoStore.reset()` to restore the canonical demo data so the tour experience is fresh
- On desktop, this can also appear as a sidebar menu item labeled "Replay Demo Tour"

### 3. Add task completion celebration

When a guest user checks off a task, show a brief animated celebration:

- Create a small `TaskCelebration` component that renders a confetti burst or a satisfying checkmark animation using Framer Motion
- In `TaskList.tsx`, when `toggleTaskCompletion` is called and the task transitions from incomplete to complete, trigger the celebration overlay for ~1.5 seconds
- The celebration is a centered animated checkmark with a "Nice work!" message that auto-dismisses
- Keep it lightweight — pure CSS/Framer Motion, no new dependencies

---

## Files to Change

### Modified Files

| File | Change |
|------|--------|
| `src/data/demoTourSteps.ts` | Add `interactive: boolean` field to step 2 (Tasks) |
| `src/components/DemoTour.tsx` | When `step.interactive` is true, remove the blocking overlay; render tour card as a non-blocking floating element instead |
| `src/stores/demoTourStore.ts` | No change needed — `start()` already resets to step 0 |
| `src/layouts/AppLayout.tsx` | Add a floating "Replay Tour" button for guest users when tour is inactive |
| `src/pages/TaskList.tsx` | Add celebration animation when a task is toggled to complete |

### New Files

| File | Purpose |
|------|---------|
| `src/components/TaskCelebration.tsx` | Animated celebration overlay (checkmark + "Nice work!" text) shown briefly on task completion |

---

## Technical Details

### DemoTour.tsx Changes

```text
Current behavior:
  - Full-screen overlay with pointer-events-auto on ALL steps
  - Clicking overlay calls skip() -> tour ends

New behavior:
  - Non-interactive steps (0, 2-5): Keep the overlay but clicking it goes to NEXT step instead of skip
  - Interactive step (1 - Tasks): No overlay at all; tour card is positioned at the top of the screen
    as a floating banner so the task list below remains fully tappable
  - Skip button still available on the card itself via the X button
```

### Floating Replay Button

```text
Position: fixed bottom-20 right-4 (above bottom nav on mobile), bottom-6 right-6 on desktop
Visibility: only when user.id === 'demo-user' AND !demoTourStore.isActive
Behavior: onClick -> demoStore.reset() then demoTourStore.start()
Style: 48px circle, primary-500 background, white icon, subtle shadow + pulse animation
```

### TaskCelebration Component

```text
Trigger: when toggleTaskCompletion flips a task from completed=false to completed=true
Animation: scale-in checkmark icon (green) + "Nice work!" text, auto-dismiss after 1.5s
Position: fixed center of screen, z-50
Built with: Framer Motion (already installed), no new deps
```

### Overlay Click Behavior Change

Instead of `onClick={skip}` on the overlay, change to `onClick={next}` so tapping anywhere advances the tour rather than ending it abruptly. The X button and "Skip tour" text remain for intentional dismissal.

---

## Summary

Three targeted fixes, one new component, no new dependencies. The tour becomes usable (non-blocking on interactive steps), recoverable (replay button always available), and delightful (celebration on task completion).
