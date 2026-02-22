

# UX Overhaul: Fewer Clicks, More Intuitive

## 1. Rename "Gallery" to "Journal"

The word "Gallery" implies a photo album. This section is really an onboarding journal where you capture notes, learnings, and photos that drive mission progress.

**Changes:**
- Rename everywhere: bottom nav, sidebar, dashboard card, tour steps, page header
- Update the icon from `Image` to `BookOpen` (lucide) -- feels more like a journal
- Update page subtitle to: "Capture notes, photos, and key moments from your onboarding"

**Files:** `BottomNav.tsx`, `AppLayout.tsx`, `Dashboard.tsx`, `Gallery.tsx`, `demoTourSteps.ts`

---

## 2. Fix Dashboard to Show Real Data

The dashboard currently has hardcoded meeting and notes data. It should pull from the actual People and Gallery/Journal stores.

**Changes:**
- Pull upcoming meetings from the People store (sorted by meetingDate, showing next 2-3)
- Pull recent notes from the Gallery store (sorted by date, showing latest 2-3)
- Show empty states with action prompts ("Add your first contact" / "Start your first journal entry") instead of fake data

**Files:** `Dashboard.tsx`

---

## 3. Make Mission-Journal Connection Obvious

Right now, users have no idea that adding tagged journal entries progresses their missions. This is the core loop of the app and it's hidden.

**Changes:**
- On each mission card, add a clear CTA: "Add Journal Entry" (instead of the hover-only "Add to Gallery" text)
- In the Journal page, when adding an item, show a small banner: "This entry will count toward: [Mission Name]" when selected tags match a mission's requirements
- After saving a journal entry that progresses a mission, show a toast: "Mission 'Team Connection' is now 66% complete!"

**Files:** `Missions.tsx`, `Gallery.tsx` (renamed to Journal), `missionStore.ts`

---

## 4. Quick-Add for Tasks

The current task form requires 4 fields minimum (title, tags, due date, description). For a quick check-off app, this is too heavy.

**Changes:**
- Add a quick-add bar at the top of the task list: just a text input + Enter to create
- Auto-assign: department = "General", priority = "medium", due date = 5 business days from now, tags = []
- Keep the full form available via "Add New Task" button for detailed entries
- Remove the requirement for tags to be mandatory when creating tasks

**Files:** `TaskList.tsx`, `TaskForm.tsx`

---

## 5. Post-Completion Prompt on Tasks

When a user checks off a task, prompt them to capture a quick note about it. This feeds the journal and missions naturally.

**Changes:**
- After toggling a task complete, show a small inline prompt below the task: "How did it go? Add a quick note" with a text input
- If the user types something and hits Enter, auto-create a journal entry with the task title as the title, the note as content, and the task's tags carried over
- If the user dismisses it (clicks away or X), nothing happens -- zero friction for people who just want to check boxes

**Files:** `TaskList.tsx`, hook into gallery/journal store

---

## 6. Persist People Data

The People page loses all data on refresh because it uses `useState` with hardcoded initial data instead of a Zustand store.

**Changes:**
- Create or use the existing `employeeStore.ts` pattern to persist people data with Zustand + persist middleware
- Migrate the hardcoded initial people into the store as defaults
- Replace all `useState` people management in `PeopleNotes.tsx` with store calls

**Files:** `PeopleNotes.tsx`, new or updated store file

---

## Priority Order

| Priority | Change | Impact | Effort |
|----------|--------|--------|--------|
| 1 | Rename Gallery to Journal | Clarity | Low |
| 2 | Fix Dashboard real data | Trust | Medium |
| 3 | Mission-Journal connection | Core loop | Medium |
| 4 | Quick-add tasks | Speed | Low |
| 5 | Post-completion prompt | Engagement | Medium |
| 6 | Persist People data | Reliability | Medium |

---

## Technical Details

### Rename Gallery to Journal
- `BottomNav.tsx`: Change label from `'Gallery'` to `'Journal'`, icon from `Image` to `BookOpen`
- `AppLayout.tsx` sidebar: Same label and icon change
- `Gallery.tsx`: Update page header text from "Gallery & Notes" to "Journal"
- `Dashboard.tsx`: Update "Recent Notes" card to say "Recent Journal Entries" and link text
- `demoTourSteps.ts`: Update the gallery tour step title/body to reference "Journal"

### Dashboard Real Data
- Import `useGalleryData` (or equivalent journal hook) and people store
- Replace hardcoded `upcomingMeetings` array with people sorted by `meetingDate` where date is in the future
- Replace hardcoded `recentNotes` array with actual gallery items sorted by `createdAt` descending
- Add empty state UI for both sections

### Mission-Journal Connection
- In `Missions.tsx`: Make the "Add to Gallery" text always visible (not just on hover), rename to "Add Journal Entry"
- In `Gallery.tsx`: After selecting tags on a new item, check `missionStore` for missions whose `requirements[].tag` matches any selected tag, and display a banner showing which mission(s) will progress
- In the `addItem` flow in `useAppData.ts` or the gallery store: after adding, call `updateMissionProgress` for all missions and show a toast if any mission progressed

### Quick-Add Tasks
- Add a simple input bar above the task list in `TaskList.tsx`
- On Enter, call `addTask` with defaults: `{ title: inputValue, tags: [], department: 'General', priority: 'medium', description: '', dueDate: calculated, startDate: userOnboardingStartDate, completed: false, notes: '' }`
- In `TaskForm.tsx`: Change `!formData.tags?.length` validation to allow empty tags

### Post-Completion Prompt
- In `TaskList.tsx`, after `toggleTaskCompletion` for an incomplete task, set a `promptTaskId` state
- Render a small inline form below that task card with a text input
- On submit, create a journal entry via `addItem` with `title: task.title`, `content: userNote`, `tags: task.tags`, `type: 'note'`
- Dismiss on blur, X click, or after 10 seconds

### Persist People Data
- Create `src/stores/peopleStore.ts` using Zustand with `persist` middleware
- Move the `initialPeople` array as default store data
- Expose `people`, `addPerson`, `updatePerson`, `deletePerson` actions
- Refactor `PeopleNotes.tsx` to import from the store instead of using local state

