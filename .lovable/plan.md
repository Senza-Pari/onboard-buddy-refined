

# Fix White Screen and Update Hero Image

## Problem 1: White Screen
The app crashes on load because `BuddyChatDrawer.tsx` imports from `@/integrations/supabase/client`, which is the auto-generated Supabase client. This client calls `createClient(undefined, undefined)` when environment variables aren't available, throwing "supabaseUrl is required" and crashing the entire app.

## Problem 2: Hero Image Update
You want to replace the current Welcome page background image with the uploaded professional woman photo.

## Solution

### 1. Fix White Screen (`src/components/BuddyChatDrawer.tsx`)
- Remove the import of the auto-generated Supabase client
- Instead, build the Supabase URL and key using the project ID constant as a reliable fallback:
  - URL: `https://tsfnrqcrttxaorcxkhoy.supabase.co`
  - Key: use `VITE_SUPABASE_PUBLISHABLE_KEY` env var
- This avoids the crash because we won't call `createClient()` at all -- we only need the URL and key strings for fetch calls

### 2. Update Hero Image
- Copy the uploaded image to `public/images/hero-welcome.png`
- Update the default background URL in `src/stores/imageStore.ts` (line 26) to point to `/images/hero-welcome.png` instead of the external `cameronstewart.click` URL
- Update `src/components/CoverImageSettings.tsx` references to the default URL as well

### Files Changed

| File | Change |
|------|--------|
| `src/components/BuddyChatDrawer.tsx` | Remove `@/integrations/supabase/client` import; use hardcoded project URL as fallback |
| `src/stores/imageStore.ts` | Change default welcome background to new hero image |
| `src/components/CoverImageSettings.tsx` | Update default image URL references to match |
| `public/images/hero-welcome.png` | New file -- the uploaded hero image |
