
# Demo Mode: Make the App Fully Explorable Without Sign-In

## Overview
Transform the app into a portfolio-ready demo experience. Visitors can explore everything instantly via a "Try Demo" button on the Welcome page -- no email, no password, no friction. All premium/payment gates get removed or hidden.

## What Changes

### 1. Add "Explore as Guest" to the Welcome Page
- Add a prominent "Explore as Guest" button alongside the existing Sign Up and Sign In buttons
- Clicking it sets a demo user in the auth store (no real authentication, just a fake user object with full permissions) and navigates straight to `/dashboard`

### 2. Update Auth Store with a `loginAsGuest` Method
- Add a new `loginAsGuest()` function that sets a demo user object:
  - Name: "Demo User"
  - Email: "demo@onboardbuddy.com"
  - Company: "Acme Inc."
  - Roles: `['super_admin']` (so everything is accessible)
  - Permissions: `['*']`
- No database call, no network request -- purely local state

### 3. Remove Auth Gates on Routes
- Update `App.tsx` so all protected routes (`/dashboard`, `/tasks`, `/missions`, `/people`, `/gallery`, `/export`, `/templates`, `/templates/:type`) no longer redirect to `/login`
- Instead, they just render their components directly (or still check `isAuthenticated` but the guest login satisfies it)

### 4. Hide/Remove Payment & Premium Gating
- **PremiumBanner**: Hide it entirely (or remove the component usage from `AppLayout`)
- **PremiumFeatureTooltip / Crown icon**: Remove from the Templates nav item in `AppLayout`
- **PremiumUpgradeModal**: Comment out or skip any premium checks that block features
- **Pricing page**: Keep it in routing but remove the redirect logic for `cam@dollen.com`; make all "Get Started" buttons go to the demo instead of signup
- **useSubscription hook**: Return `isPremium: true` always so no features are gated

### 5. Clean Up AppLayout Sidebar
- Change "Sign Out" to navigate back to `/` and clear the auth store (already mostly does this)
- Remove the share button's UUID validation gate (demo user won't have a real UUID) -- just hide the Share button in demo mode
- Remove the premium banner import

### 6. Keep Login/SignUp Pages Accessible
- Keep `/login` and `/signup` routes in place but they become secondary paths
- The primary flow is Welcome -> "Explore as Guest" -> Dashboard

---

## Technical Details

**Files to modify:**
- `src/stores/authStore.ts` -- add `loginAsGuest()` method
- `src/pages/Welcome.tsx` -- add "Explore as Guest" button
- `src/App.tsx` -- simplify route guards
- `src/layouts/AppLayout.tsx` -- remove PremiumBanner, remove premium gating on Templates nav, handle demo user in sidebar
- `src/hooks/useSubscription.ts` -- return `isPremium: true` always
- `src/pages/Pricing.tsx` -- redirect "Get Started" buttons to guest demo flow or simplify
- `src/components/PremiumBanner.tsx` -- can be left as-is but removed from AppLayout

**No database changes needed** -- this is purely frontend state and routing.
