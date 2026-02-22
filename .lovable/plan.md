

# Enable Buddy for Demo Users with Usage Limits

## Overview

Make Buddy accessible to all users (including demo/guest) while adding a usage cap to prevent excessive API costs during demos.

## Changes

### 1. Remove Guest Restriction (`src/layouts/AppLayout.tsx`)
- Change `{!isGuest && <BuddyChat />}` to always render `<BuddyChat />`
- Move the "Replay Tour" sparkle button to coexist (shift it up so both FABs stack)

### 2. Add Buddy to Bottom Nav (`src/components/BottomNav.tsx`)
- Add "Buddy" as a 6th item with `MessageCircle` icon
- Instead of navigating, it opens the `BuddyChatDrawer` via local state
- This makes Buddy immediately visible on mobile

### 3. Add Usage Limit for Demo Users (`src/components/BuddyChatDrawer.tsx`)
- Track message count in component state (resets on page refresh, which is fine for demo)
- Cap at **10 messages per session** for guest users (demo-user)
- When limit is reached, show a friendly message: "You've used all 10 demo messages! Sign up for unlimited access."
- Disable the input and show a sign-up CTA button
- Authenticated users get unlimited usage (no cap)

### 4. Improve Desktop FAB Visibility (`src/components/BuddyChat.tsx`)
- Add an "Ask Buddy" text label that shows on first render, then collapses to icon-only after first open (tracked via `localStorage`)
- Add a subtle pulse animation for undiscovered state

## Technical Details

**Usage tracking (BuddyChatDrawer):**
- Add state: `const [messageCount, setMessageCount] = useState(0)`
- Import `useAuthStore` to check `user?.id === 'demo-user'`
- Increment `messageCount` on each `send()` call
- Before sending, check if `isGuest && messageCount >= 10` -- if so, show limit message instead
- Display remaining count in header: "8/10 messages" for guests

**BottomNav Buddy tab:**
- Import `BuddyChatDrawer` and `useState`
- Add a button (not NavLink) as the 6th item that toggles `isBuddyOpen`
- Render `<BuddyChatDrawer isOpen={isBuddyOpen} onClose={() => setIsBuddyOpen(false)} />`

**AppLayout FAB stacking:**
- Show both Buddy FAB and Replay Tour FAB for guests
- Replay Tour button moves to `bottom-36` (above Buddy's `bottom-20`) on mobile

## Files Changed

| File | Change |
|------|--------|
| `src/layouts/AppLayout.tsx` | Remove `!isGuest` guard; stack both FABs for guests |
| `src/components/BottomNav.tsx` | Add Buddy as 6th nav item opening the chat drawer |
| `src/components/BuddyChatDrawer.tsx` | Add 10-message session cap for demo users with sign-up CTA |
| `src/components/BuddyChat.tsx` | Add "Ask Buddy" label + pulse for desktop; hide on mobile (bottom nav handles it) |

