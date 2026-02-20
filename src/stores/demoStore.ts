import { create } from 'zustand';
import { type Task } from './taskStore';
import { type GalleryItem } from './galleryStore';
import { DEMO_TASKS, DEMO_GALLERY_ITEMS, DEMO_GALLERY_TAGS } from '../data/demoData';
import useMissionStore from './missionStore';

interface DemoState {
  // Task state
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  toggleTaskCompletion: (id: number) => void;

  // Gallery state
  items: GalleryItem[];
  galleryTags: string[];
  addItem: (item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<GalleryItem>) => void;
  deleteItem: (id: string) => void;
  addTag: (tag: string) => void;

  // Reset
  reset: () => void;
}

const useDemoStore = create<DemoState>()((set) => ({
  tasks: [...DEMO_TASKS],
  items: [...DEMO_GALLERY_ITEMS],
  galleryTags: [...DEMO_GALLERY_TAGS],

  addTask: (task) => {
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: Math.max(...state.tasks.map((t) => t.id), 0) + 1,
          createdAt: new Date().toISOString(),
          tags: task.tags || [],
        },
      ],
    }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, tags: updates.tags || task.tags || [] } : task
      ),
    }));
  },

  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  toggleTaskCompletion: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    })),

  addItem: (item) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      permissions: item.permissions || { public: false, editable: true, allowComments: true },
    };
    set((state) => ({ items: [...state.items, newItem] }));

    // Update mission progress
    const { missions, updateMissionProgress } = useMissionStore.getState();
    missions.forEach((m) => updateMissionProgress(m.id));
  },

  updateItem: (id, updates) =>
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
      );
      const { missions, updateMissionProgress } = useMissionStore.getState();
      missions.forEach((m) => updateMissionProgress(m.id));
      return { items: updatedItems };
    }),

  deleteItem: (id) =>
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      const { missions, updateMissionProgress } = useMissionStore.getState();
      missions.forEach((m) => updateMissionProgress(m.id));
      return { items: updatedItems };
    }),

  addTag: (tag) => set((state) => ({ galleryTags: [...state.galleryTags, tag] })),

  reset: () =>
    set({
      tasks: [...DEMO_TASKS],
      items: [...DEMO_GALLERY_ITEMS],
      galleryTags: [...DEMO_GALLERY_TAGS],
    }),
}));

// Register on window for cross-store access (avoids circular imports)
(window as any).__demoStore = useDemoStore;

export default useDemoStore;
