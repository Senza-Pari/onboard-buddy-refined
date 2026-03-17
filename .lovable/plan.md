
Goal: restore the app from the current white-screen state in both preview and published builds, then harden startup so one broken feature cannot blank the whole app again.

What I found
- The most likely root cause is the recent `jspdf` upgrade to `4.2.0`.
- `src/App.tsx` eagerly imports `src/pages/ContentExport.tsx`, which eagerly imports `src/lib/pdfGenerator.ts`, which eagerly imports `jspdf`.
- If that library breaks in Vite/browser at runtime, the whole app fails before `/` can render, which matches “everything is white,” including the published site.
- I also found a separate routing bug in `src/components/ProtectedRoute.tsx`: redirects point to `"/login\"` and `"/dashboard\"` instead of valid routes. That likely won’t cause the initial white screen on `/`, but it will break protected-route navigation.

Implementation plan
1. Remove the startup dependency on PDF code
   - Stop loading `jspdf` during initial app boot.
   - Move PDF generation to a lazy/dynamic import inside the export action, or lazy-load the export page route.
   - This isolates Export so a PDF library issue cannot crash the entire application.

2. Fix the protected-route redirect bug
   - Correct the malformed redirect paths in `src/components/ProtectedRoute.tsx`.
   - Ensure unauthorized users go to `/login` and failed role checks go to `/dashboard`.

3. Stabilize app boot
   - Audit startup-critical imports only: `src/App.tsx`, auth store, layout components.
   - Keep route-level features from being imported eagerly if they are not needed on the welcome page.
   - If needed, wrap route loading more defensively so a nonessential feature fails locally instead of taking down the app shell.

4. Verify the auth/client path is not contributing
   - The app currently mixes two backend client modules (`src/integrations/supabase/client.ts` and `src/lib/supabase.ts`).
   - I would review and standardize usage in app-owned code so startup does not depend on a fragile client path or env assumption.

5. Re-test systematically
   - Verify `/` renders first.
   - Verify published app renders after frontend update.
   - Then verify login, dashboard, export page load, and PDF export specifically.

Technical details
- Likely failure chain:
  ```text
  App.tsx
    -> ContentExport.tsx
      -> pdfGenerator.ts
        -> jspdf 4.2.0
          -> runtime/module failure
            -> React app never mounts
  ```
- Files I would change first:
  - `src/pages/ContentExport.tsx`
  - `src/lib/pdfGenerator.ts`
  - `src/App.tsx`
  - `src/components/ProtectedRoute.tsx`
  - possibly `src/stores/authStore.ts` if client standardization is needed
- Lowest-risk fix:
  - keep current Export UI
  - dynamically import PDF code only when the user clicks Export as PDF
  - fix malformed redirects
- Optional follow-up:
  - add route-level lazy loading for heavier pages like Export/Admin/Templates so future library regressions don’t crash the landing page.

Expected outcome
- Welcome page renders again instead of a blank screen.
- Published app stops showing a white page.
- Export remains available, but any PDF-specific failure is contained to the export action/page instead of killing the whole app.
- Protected admin/login redirects work correctly again.
