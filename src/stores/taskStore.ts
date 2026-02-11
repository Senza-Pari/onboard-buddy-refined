import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addBusinessDays, isBefore, isAfter, parseISO } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export interface Task {
  id: number;
  title: string;
  tags: string[];
  dueDate: string;
  completed: boolean;
  description: string;
  notes?: string;
  link?: string;
  createdAt: string;
  startDate: string;
  department: 'HR' | 'IT' | 'Manager';
  priority: 'high' | 'medium' | 'low';
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  toggleTaskCompletion: (id: number) => void;
  calculateDueDate: (taskType: string, startDate: string) => string;
  validateDueDate: (dueDate: string, startDate: string) => boolean;
}

const MIN_DURATION = 1;
const MAX_DURATION = 30;

// Core tasks that appear in the main Tasks page
const INITIAL_TASKS: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    title: 'Submit I-9 documentation',
    tags: ['admin', 'hr'],
    department: 'HR',
    description: 'Provide required identification and work authorization documents.',
    startDate: '',
    dueDate: '',
    completed: false,
    priority: 'high',
  },
  {
    title: 'Complete W-4 tax forms',
    tags: ['admin', 'hr'],
    department: 'HR',
    description: 'Fill out federal and state tax withholding forms.',
    startDate: '',
    dueDate: '',
    completed: false,
    priority: 'high',
  },
  {
    title: 'Set up workstation',
    tags: ['setup', 'equipment'],
    department: 'IT',
    description: 'Configure your computer and workspace setup.',
    startDate: '',
    dueDate: '',
    completed: false,
    priority: 'high',
  },
  {
    title: 'Meet with manager',
    tags: ['team', 'meetings'],
    department: 'Manager',
    description: 'Initial meeting with your direct supervisor.',
    startDate: '',
    dueDate: '',
    completed: false,
    priority: 'high',
  }
];

const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: INITIAL_TASKS.map((task, index) => ({
        ...task,
        id: index + 1,
        createdAt: new Date().toISOString(),
      })),

      calculateDueDate: (taskType: string, startDate: string) => {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const zonedStartDate = utcToZonedTime(parseISO(startDate), userTimeZone);
        const duration = 5; // Default to 5 business days
        const dueDate = addBusinessDays(zonedStartDate, duration);
        return zonedTimeToUtc(dueDate, userTimeZone).toISOString().split('T')[0];
      },

      validateDueDate: (dueDate: string, startDate: string) => {
        const dueDateObj = parseISO(dueDate);
        const startDateObj = parseISO(startDate);
        const maxDate = addBusinessDays(startDateObj, MAX_DURATION);
        const minDate = addBusinessDays(startDateObj, MIN_DURATION);

        return (
          isAfter(dueDateObj, minDate) &&
          isBefore(dueDateObj, maxDate)
        );
      },

      addTask: (task) => {
        const startDate = task.startDate;
        const calculatedDueDate = get().calculateDueDate(task.tags[0], startDate);
        
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: Math.max(...state.tasks.map((t) => t.id), 0) + 1,
              createdAt: new Date().toISOString(),
              dueDate: calculatedDueDate,
              tags: task.tags || []
            },
          ],
        }));
      },

      updateTask: (id, updates) => {
        if (updates.dueDate && updates.startDate) {
          const isValid = get().validateDueDate(updates.dueDate, updates.startDate);
          if (!isValid) {
            throw new Error('Invalid due date');
          }
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { 
              ...task, 
              ...updates,
              tags: updates.tags || task.tags || []
            } : task
          ),
        }));
      },

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskCompletion: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),
    }),
    {
      name: 'onboard-buddy-tasks',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            tasks: persistedState.tasks || INITIAL_TASKS.map((task, index) => ({
              ...task,
              id: index + 1,
              createdAt: new Date().toISOString(),
            }))
          };
        }
        return persistedState as { tasks: Task[] };
      }
    }
  )
);

export default useTaskStore;