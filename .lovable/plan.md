

# Admin Feature Control Panel

## What We're Building
A new `/admin` route with a feature toggle dashboard. Each major feature in the app can be turned on/off, and is labeled as either **Core** (essential to onboarding) or **Add-on** (enhances the experience). Toggling a feature off hides it from the sidebar, bottom nav, and dashboard.

## Feature Registry

| Feature | Category | Controls |
|---------|----------|----------|
| Tasks | Core | `/tasks` route, nav item, dashboard card |
| Missions | Core | `/missions` route, nav item, dashboard card |
| People / Meet & Greet | Core | `/people` route, nav item, dashboard card |
| Journal / Gallery | Core | `/gallery` route, nav item, dashboard card |
| Buddy AI Chat | Add-on | Chat FAB, bottom nav buddy button |
| Export / PDF | Add-on | `/export` route, nav item |
| Templates | Add-on | `/templates` route, nav item |
| Share Journey | Add-on | Share button in sidebar |
| AI Task Suggestions | Add-on | Suggest button on Tasks page |
| Milestone Celebrations | Add-on | Confetti overlay |
| "What To Do Now" Card | Add-on | Dashboard priority card |
| Overdue Warnings | Add-on | Red badges on tasks |

## Implementation

### 1. New Store: `src/stores/featureStore.ts`
- Zustand + persist
- Object map of feature keys → `{ enabled: boolean, label: string, category: 'core' | 'addon', description: string }`
- `toggleFeature(key)` and `isEnabled(key)` methods
- All features default to `enabled: true`

### 2. New Page: `src/pages/Admin.tsx`
- Two sections: "Core Features" and "Add-on Features"
- Each feature shows: name, description, category badge, toggle switch
- Core features show a warning when disabling ("This is a core feature")
- Clean card-based layout matching existing app style
- Only accessible to super_admin role (hardcoded check from authStore)

### 3. Updated Files (consume `featureStore.isEnabled()`)
- **`src/layouts/AppLayout.tsx`** — conditionally render sidebar nav items
- **`src/components/BottomNav.tsx`** — conditionally render bottom nav items
- **`src/pages/Dashboard.tsx`** — conditionally render cards (missions, people, journal, WhatToDoNow)
- **`src/App.tsx`** — add `/admin` route (protected, super_admin only)

### 4. Nav Entry
- Add "Admin" link in sidebar footer (next to Settings), visible only to super_admin users
- Uses `Shield` icon from lucide-react

## Files Changed/Created

| File | Action |
|------|--------|
| `src/stores/featureStore.ts` | **Create** — feature toggle state |
| `src/pages/Admin.tsx` | **Create** — admin panel UI |
| `src/layouts/AppLayout.tsx` | **Edit** — filter nav items by feature flags, add Admin link |
| `src/components/BottomNav.tsx` | **Edit** — filter nav items by feature flags |
| `src/pages/Dashboard.tsx` | **Edit** — conditionally render sections |
| `src/App.tsx` | **Edit** — add `/admin` route |

