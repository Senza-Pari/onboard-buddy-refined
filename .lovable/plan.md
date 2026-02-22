
# Fix "No sign-up required" Text Placement

## Problem

The "No sign-up required - 2 minute tour" text is sitting between the buttons because it's a sibling inside a `flex-row` container. On desktop (sm+), the buttons go horizontal and the text awkwardly sits between "Start Interactive Demo" and "Sign Up Free."

## Fix

Wrap the demo button and its subtitle together in a `div` so they stay grouped as a unit. The subtitle will always appear directly below the demo button regardless of screen size.

## Technical Details

### `src/pages/Welcome.tsx` (lines 61-68)

Wrap the `<button>` and the `<p>` tag in a single `<div className="flex flex-col items-center">` so they're treated as one flex item:

```
<div className="flex flex-col items-center">
  <button ...>
    Start Interactive Demo
  </button>
  <p className="text-white/60 text-sm mt-2">No sign-up required - 2 minute tour</p>
</div>
```

Also change `-mt-2` to `mt-2` so there's proper spacing below the button instead of a negative margin pulling it up.
