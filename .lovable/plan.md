

# Auto-Scroll to First Uncompleted Task and Add Click Callout During Tour

## Problem

On the Tasks page during the interactive tour step, the first 3 tasks are already completed, so the first uncompleted task (task #4, "Complete W-4 tax forms") is below the fold. Users have to scroll to find something to check off, which breaks the guided flow. There's also no visual indicator showing *where* to click.

## Solution

Two changes to make the interactive step seamless:

### 1. Auto-scroll to the first uncompleted task

When the tour is active and on the interactive Tasks step, automatically scroll the first uncompleted task into view using `scrollIntoView()`. This ensures the user immediately sees an actionable item without hunting.

### 2. Add a pulsing callout on the checkbox

The first uncompleted task's circle/checkbox gets a glowing pulse animation (reusing the existing `tour-glow` style) plus a small animated arrow or "Tap here" label pointing at it. This makes it unmistakable where to click.

## Files to Change

| File | Change |
|------|--------|
| `src/pages/TaskList.tsx` | Import `useDemoTourStore` and `TOUR_STEPS`. When the tour is active on the Tasks step: (1) use a `ref` + `useEffect` to scroll the first uncompleted task into view, and (2) add the `tour-glow` class plus an animated pointing indicator to that task's checkbox. |
| `src/components/DemoTour.tsx` | No changes needed -- the interactive step already removes the overlay. |

No new files or dependencies needed.

## Technical Details

### TaskList.tsx Changes

- Import `useDemoTourStore` and check `isActive` + `currentStep`
- Determine if the current tour step is the Tasks interactive step (step index 1, route `/tasks`)
- Find the first uncompleted task in `filteredTasks`
- Attach a `ref` to that task's card element
- In a `useEffect`, when the tour is on this step, call `ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })` to bring it into view
- Apply `tour-glow` class and a small animated "tap here" indicator (a bouncing arrow icon from lucide) to the checkbox of that specific task
- The callout disappears once the task is checked off (the celebration fires instead)

### Scroll + Highlight Logic

```text
const isTourOnTasks = isTourActive && TOUR_STEPS[currentStep]?.route === '/tasks';
const firstIncompleteIndex = filteredTasks.findIndex(t => !t.completed);

// For the task at firstIncompleteIndex when isTourOnTasks:
//   1. Attach a ref and scrollIntoView on mount
//   2. Add tour-glow class to the card
//   3. Show a small animated arrow pointing at the circle icon
```

### Visual Callout

The callout will be a small `ChevronLeft` or arrow icon positioned to the left of the checkbox, animated with a horizontal bounce (translateX oscillation) using Framer Motion. Combined with the existing `tour-glow` on the card border, this creates a clear "click here" signal without adding clutter.

