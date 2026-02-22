

# Build Out the Admin Template Builder

## The Problem

The admin side (Templates) exists but is mostly a shell. An admin/manager who wants to configure the onboarding experience for a new hire currently cannot:

- Add, edit, or remove **tasks** from a template
- Add, edit, or remove **missions** from a template
- Connect the template's **people** to what the new hire sees
- Deploy a template so a new hire gets pre-populated tasks, missions, and key contacts

Only Step 3 (People) in the template builder has a working UI. Steps 1 and 2 are stubs.

## What We'll Build

### 1. Template Tasks Step (Step 1 in TemplateBuilder)

Add a full task management UI within the template builder:
- List all tasks assigned to this template with title, department, priority, tags
- "Add Task" button opens a simplified version of the existing TaskForm
- Inline edit and delete for each task
- Drag to reorder (optional, can be a follow-up)

Data will be stored in a new `templateStore` that holds per-template configurations (tasks, missions, people) rather than mixing with the user-facing `taskStore`.

### 2. Template Missions Step (Step 2 in TemplateBuilder)

Add a mission management UI:
- List all missions for this template with title, description, tag requirements
- "Add Mission" button opens a simplified MissionForm
- Edit and delete for each mission
- Show tag requirement badges so the admin can see what journal tags will drive progress

### 3. Template Store

Create `src/stores/templateStore.ts` to hold template configurations:
- Each template has an `id`, `type`, `name`, `tasks[]`, `missions[]`, `people[]`
- Pre-populate the 3 built-in templates (Remote, Onsite, Hybrid) with their existing hardcoded data
- Custom templates start empty
- Persisted with Zustand persist middleware

### 4. Deploy/Apply Template

Add a "Deploy Template" flow:
- When admin clicks "Finish Setup", the template's tasks get pushed into `taskStore`, missions into `missionStore`, and people into `peopleStore`
- This replaces the hardcoded INITIAL_TASKS and INITIAL_MISSIONS with whatever the admin configured
- Show a confirmation: "This will set up the onboarding for [template name]. Continue?"

### 5. Make Steps Navigable

Currently `currentStep` is hardcoded to 2. Change it to be interactive:
- Clicking step indicators navigates between steps
- Each step shows its respective content (Tasks, Missions, People)
- "Next" and "Back" buttons at the bottom of each step
- Progress tracked per step (e.g., "3 tasks added", "2 missions configured")

---

## Technical Details

### New file: `src/stores/templateStore.ts`

```
interface TemplateConfig {
  id: string;
  type: 'remote' | 'onsite' | 'hybrid' | 'custom';
  name: string;
  tasks: TemplateTask[];
  missions: TemplateMission[];
  people: string[]; // employee IDs from employeeStore
}

interface TemplateTask {
  id: string;
  title: string;
  description: string;
  department: 'HR' | 'IT' | 'Manager';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  durationDays: number; // business days from start date
}

interface TemplateMission {
  id: string;
  title: string;
  description: string;
  requirements: { tag: string; count: number }[];
  reward: { type: 'points' | 'badge' | 'achievement'; value: number | string };
}
```

Pre-populated with the existing hardcoded data from `taskStore` (4 tasks) and `missionStore` (3 missions) mapped into all 3 built-in templates.

### Updated: `src/pages/TemplateBuilder.tsx`

- Remove hardcoded `currentStep = 2`, make it `useState(0)`
- Add step navigation (clickable step indicators + Next/Back buttons)
- Step 0: Render a `TemplateTasksStep` component showing template tasks with add/edit/delete
- Step 1: Render a `TemplateMissionsStep` component showing template missions with add/edit/delete
- Step 2: Keep existing People UI (already works)
- "Finish Setup" calls a `deployTemplate()` function that pushes template data into the user-facing stores

### New components

| Component | Purpose |
|-----------|---------|
| `src/components/TemplateTasksStep.tsx` | Task list + add/edit within template builder |
| `src/components/TemplateMissionsStep.tsx` | Mission list + add/edit within template builder |
| `src/components/TemplateTaskForm.tsx` | Simplified task form for template context |
| `src/components/TemplateMissionForm.tsx` | Simplified mission form for template context |

### Updated: `src/stores/taskStore.ts`

- Add a `setTasks(tasks: Task[])` action that replaces the entire task list (used by template deploy)
- Keep `INITIAL_TASKS` as the fallback when no template has been deployed

### Updated: `src/stores/missionStore.ts`

- Add a `setMissions(missions: Mission[])` action that replaces the entire mission list (used by template deploy)
- Keep `INITIAL_MISSIONS` as the fallback

### Updated: `src/stores/peopleStore.ts`

- Add a `setPeople(people: Person[])` action for template deploy

---

## User Flow (Admin)

1. Go to Templates, pick "Remote Hire Template"
2. **Step 1 - Tasks**: See 4 pre-loaded tasks. Add "Set up VPN access", edit "Meet with manager" to change priority, delete "Submit I-9" if not needed
3. **Step 2 - Missions**: See 3 pre-loaded missions. Add "Security Training" mission with tag requirements
4. **Step 3 - People**: Add key contacts (manager, IT support, HR rep)
5. Click "Finish Setup" -- tasks, missions, and people are pushed to the user-facing stores
6. New hire logs in and sees exactly what the admin configured

## Priority Order

| Priority | Change | Impact | Effort |
|----------|--------|--------|--------|
| 1 | Template store | Foundation for everything | Medium |
| 2 | Step navigation in TemplateBuilder | Unlocks Steps 1 and 2 | Low |
| 3 | Tasks step UI | Core admin functionality | Medium |
| 4 | Missions step UI | Core admin functionality | Medium |
| 5 | Deploy template flow | Connects admin to user experience | Medium |
