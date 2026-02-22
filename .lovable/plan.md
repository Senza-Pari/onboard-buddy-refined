

# Remove Dark Overlay from All Tour Steps

## What's Changing

Currently, only the interactive step (step 2 - Tasks) has no dark shaded background overlay. All other steps show a `bg-black/50` overlay that dims the page. We'll remove this overlay from every step so the tour card always floats over the live page content, just like step 2 already does.

## Changes

| File | Change |
|------|--------|
| `src/components/DemoTour.tsx` | Remove the conditional overlay `div` entirely. Use the top-positioned floating card layout (currently only used for interactive steps) for all steps, so the tour card sits in the top-right corner without blocking the page. |

## Technical Details

### DemoTour.tsx

1. Remove the `isInteractive` variable and the overlay block (lines 37-39) completely -- no more `bg-black/50` div on any step.
2. Use the floating top-right card style for all steps (the style currently only applied when `isInteractive` is true): `fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:max-w-sm rounded-2xl shadow-xl bg-white`.
3. Update the animation `initial`/`exit` to always slide in from the top (`y: -60`) since the card is always at the top now.

This means every step behaves like the current interactive step -- the page is fully visible and interactive behind the tour card.

