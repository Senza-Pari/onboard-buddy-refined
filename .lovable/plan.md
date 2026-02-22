

# Highlight Active Nav Tab During Demo Tour

## What We're Fixing

During the guided demo tour, when the tour navigates between pages (Dashboard, Tasks, Missions, etc.), the corresponding sidebar tab (desktop) and bottom nav tab (mobile) should visually "call out" to the user so it's crystal clear which section they're in. Right now the active tab just gets a subtle green background -- easy to miss, especially for first-time users.

## The Approach: Animated Glow + Pulse on Tour-Active Nav Items

When the demo tour is active, the nav item matching the current tour step's route gets a glowing, pulsing highlight effect. This works on both the sidebar (desktop) and bottom nav (mobile).

### Visual Effect

- A soft green glow/shadow radiates outward from the active nav item (`box-shadow` with `primary-400` color)
- A gentle pulse animation makes the glow breathe in and out (2s cycle)
- The effect only appears when the demo tour is running -- normal navigation keeps its current clean styling

### Desktop Sidebar

The active `NavLink` in the sidebar gets an additional CSS class during the tour that adds:
- A green glow shadow (`shadow-[0_0_12px_rgba(57,224,121,0.5)]`)
- A subtle scale-up pulse via a CSS keyframe animation
- A brighter background (`bg-primary-200` instead of `bg-primary-100`)

### Mobile Bottom Nav

The active icon in the bottom nav gets:
- The same glow effect around the icon
- A small animated ring/circle behind the icon that pulses

## Files to Change

| File | Change |
|------|--------|
| `src/layouts/AppLayout.tsx` | Import `useDemoTourStore` and pass `isTourActive` context to sidebar nav item classNames. When tour is active and the item matches the current step route, add the glow class. |
| `src/components/BottomNav.tsx` | Import `useDemoTourStore` and `TOUR_STEPS`. Add the same glow/pulse class to the matching bottom nav item during the tour. |
| `src/index.css` | Add a `.tour-glow` utility class with keyframe animation for the pulsing green glow effect. |

No new files or dependencies needed.

## Technical Details

### New CSS in `src/index.css`

A `@keyframes tour-glow-pulse` animation that oscillates a green box-shadow between subtle and bright, plus a `.tour-glow` class that applies it. This keeps the animation declarative and reusable across both nav components.

### Sidebar NavLink Logic (AppLayout.tsx)

```text
Current: isActive ? 'bg-primary-100 text-primary-700' : '...'
New:     isActive && isTourActive ? 'bg-primary-200 text-primary-700 tour-glow' 
         : isActive ? 'bg-primary-100 text-primary-700' : '...'
```

### BottomNav Logic

Same pattern: when `isTourActive` and `isActive`, add the `tour-glow` class to the nav link, making the icon glow and pulse.

### Animation Style

The glow is elegant and not distracting -- a soft breathing effect rather than a flashy strobe. It uses the existing primary green color so it feels cohesive with the brand.
