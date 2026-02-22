

# Make Tour Callout More Obvious with Blue Glow

## What's Changing

The current `tour-glow` effect uses a subtle green glow that blends into the app's green color scheme, making it easy to miss. We'll make it dramatically more visible by:

1. **Switching to a bright blue glow** (using `#3B82F6` -- the same blue used elsewhere in the app for tags and accents) which creates strong contrast against the green/neutral theme
2. **Making the glow bigger and bolder** -- larger box-shadow spread, stronger opacity, and a more noticeable scale pulse
3. **Adding a blue ring/border** to the highlighted task card and checkbox for extra emphasis

## Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Update `.tour-glow` keyframes to use bright blue (`rgba(59, 130, 246, ...)`) instead of green, increase shadow size and opacity, add a visible blue border/outline |
| `src/pages/TaskList.tsx` | Add a blue ring class to the first uncompleted task's checkbox area and update the ChevronRight arrow color to blue to match |

## Technical Details

### Updated CSS Animation (`src/index.css`)

The `tour-glow-pulse` keyframes will change from:
- Green glow: `rgba(57, 224, 121, 0.3)` with 8px/16px spread
- To blue glow: `rgba(59, 130, 246, 0.4)` with 12px/24px spread and stronger opacity (0.6 at peak)
- Scale pulse increases from 1.03 to 1.05 for more visible breathing

The `.tour-glow` class also gets a solid `2px` blue border (`border: 2px solid rgba(59, 130, 246, 0.6)`) and `border-radius` to frame the highlighted element.

### TaskList.tsx Updates

- The `ChevronRight` arrow indicator color changes from `text-primary-500` (green) to `text-blue-500` (blue) to match the new glow
- The `Circle` icon for the first uncompleted task gets a `text-blue-500` color instead of `text-neutral-400` during the tour, making the clickable target pop

