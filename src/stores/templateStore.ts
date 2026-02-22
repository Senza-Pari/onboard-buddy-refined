import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TemplateTask {
  id: string;
  title: string;
  description: string;
  department: 'HR' | 'IT' | 'Manager';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  durationDays: number;
}

export interface TemplateMission {
  id: string;
  title: string;
  description: string;
  requirements: { tag: string; count: number }[];
  reward: { type: 'points' | 'badge' | 'achievement'; value: number | string };
}

export interface TemplateConfig {
  id: string;
  type: 'remote' | 'onsite' | 'hybrid' | 'custom';
  name: string;
  tasks: TemplateTask[];
  missions: TemplateMission[];
  people: string[]; // employee IDs from employeeStore
}

const DEFAULT_TASKS: TemplateTask[] = [
  {
    id: 'tpl-task-1',
    title: 'Submit I-9 documentation',
    description: 'Provide required identification and work authorization documents.',
    department: 'HR',
    priority: 'high',
    tags: ['admin', 'hr'],
    durationDays: 5,
  },
  {
    id: 'tpl-task-2',
    title: 'Complete W-4 tax forms',
    description: 'Fill out federal and state tax withholding forms.',
    department: 'HR',
    priority: 'high',
    tags: ['admin', 'hr'],
    durationDays: 5,
  },
  {
    id: 'tpl-task-3',
    title: 'Set up workstation',
    description: 'Configure your computer and workspace setup.',
    department: 'IT',
    priority: 'high',
    tags: ['setup', 'equipment'],
    durationDays: 5,
  },
  {
    id: 'tpl-task-4',
    title: 'Meet with manager',
    description: 'Initial meeting with your direct supervisor.',
    department: 'Manager',
    priority: 'high',
    tags: ['team', 'meetings'],
    durationDays: 5,
  },
];

const DEFAULT_MISSIONS: TemplateMission[] = [
  {
    id: 'tpl-mission-1',
    title: 'Complete Onboarding Basics',
    description: 'Complete the essential onboarding tasks and documentation',
    requirements: [
      { tag: 'admin', count: 2 },
      { tag: 'hr', count: 2 },
    ],
    reward: { type: 'badge', value: 'Onboarding Pro' },
  },
  {
    id: 'tpl-mission-2',
    title: 'Team Connection',
    description: 'Meet key team members and establish connections',
    requirements: [
      { tag: 'team', count: 3 },
      { tag: 'meetings', count: 2 },
    ],
    reward: { type: 'badge', value: 'Team Player' },
  },
  {
    id: 'tpl-mission-3',
    title: 'Workspace Setup',
    description: 'Set up and customize your work environment',
    requirements: [
      { tag: 'setup', count: 2 },
      { tag: 'equipment', count: 1 },
    ],
    reward: { type: 'points', value: 100 },
  },
];

const createDefaultTemplates = (): TemplateConfig[] => [
  {
    id: 'remote',
    type: 'remote',
    name: 'Remote Hire Template',
    tasks: [...DEFAULT_TASKS],
    missions: [...DEFAULT_MISSIONS],
    people: [],
  },
  {
    id: 'onsite',
    type: 'onsite',
    name: 'Onsite Hire Template',
    tasks: [...DEFAULT_TASKS],
    missions: [...DEFAULT_MISSIONS],
    people: [],
  },
  {
    id: 'hybrid',
    type: 'hybrid',
    name: 'Hybrid Hire Template',
    tasks: [...DEFAULT_TASKS],
    missions: [...DEFAULT_MISSIONS],
    people: [],
  },
];

interface TemplateState {
  templates: TemplateConfig[];
  getTemplate: (id: string) => TemplateConfig | undefined;
  addTask: (templateId: string, task: Omit<TemplateTask, 'id'>) => void;
  updateTask: (templateId: string, taskId: string, updates: Partial<TemplateTask>) => void;
  deleteTask: (templateId: string, taskId: string) => void;
  addMission: (templateId: string, mission: Omit<TemplateMission, 'id'>) => void;
  updateMission: (templateId: string, missionId: string, updates: Partial<TemplateMission>) => void;
  deleteMission: (templateId: string, missionId: string) => void;
  addPersonToTemplate: (templateId: string, employeeId: string) => void;
  removePersonFromTemplate: (templateId: string, employeeId: string) => void;
  createCustomTemplate: (name: string) => string;
}

const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: createDefaultTemplates(),

      getTemplate: (id) => get().templates.find((t) => t.id === id),

      addTask: (templateId, task) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, tasks: [...t.tasks, { ...task, id: crypto.randomUUID() }] }
              : t
          ),
        }));
      },

      updateTask: (templateId, taskId, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  tasks: t.tasks.map((task) =>
                    task.id === taskId ? { ...task, ...updates } : task
                  ),
                }
              : t
          ),
        }));
      },

      deleteTask: (templateId, taskId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, tasks: t.tasks.filter((task) => task.id !== taskId) }
              : t
          ),
        }));
      },

      addMission: (templateId, mission) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, missions: [...t.missions, { ...mission, id: crypto.randomUUID() }] }
              : t
          ),
        }));
      },

      updateMission: (templateId, missionId, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  missions: t.missions.map((m) =>
                    m.id === missionId ? { ...m, ...updates } : m
                  ),
                }
              : t
          ),
        }));
      },

      deleteMission: (templateId, missionId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, missions: t.missions.filter((m) => m.id !== missionId) }
              : t
          ),
        }));
      },

      addPersonToTemplate: (templateId, employeeId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId && !t.people.includes(employeeId)
              ? { ...t, people: [...t.people, employeeId] }
              : t
          ),
        }));
      },

      removePersonFromTemplate: (templateId, employeeId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, people: t.people.filter((id) => id !== employeeId) }
              : t
          ),
        }));
      },

      createCustomTemplate: (name) => {
        const id = crypto.randomUUID();
        set((state) => ({
          templates: [
            ...state.templates,
            {
              id,
              type: 'custom' as const,
              name,
              tasks: [],
              missions: [],
              people: [],
            },
          ],
        }));
        return id;
      },
    }),
    {
      name: 'onboard-buddy-templates',
      version: 1,
    }
  )
);

export default useTemplateStore;
