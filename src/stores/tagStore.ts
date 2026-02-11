import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category?: string;
  usageCount: number;
  createdAt: number;
}

interface TagState {
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id' | 'usageCount' | 'createdAt'>) => string;
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id'>>) => void;
  deleteTag: (id: string) => void;
  incrementUsage: (id: string) => void;
  decrementUsage: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
  getTagsByCategory: (category: string) => Tag[];
  getMostUsedTags: (limit?: number) => Tag[];
  searchTags: (query: string) => Tag[];
}

const DEFAULT_TAGS: Omit<Tag, 'id' | 'createdAt'>[] = [
  { name: 'IT', color: '#3B82F6', category: 'department', description: 'IT related tasks', usageCount: 0 },
  { name: 'Admin', color: '#F59E0B', category: 'department', description: 'Administrative tasks', usageCount: 0 },
  { name: 'Training', color: '#10B981', category: 'type', description: 'Training activities', usageCount: 0 },
  { name: 'Equipment', color: '#8B5CF6', category: 'type', description: 'Equipment setup and configuration', usageCount: 0 },
  { name: 'HR', color: '#EC4899', category: 'department', description: 'Human Resources tasks', usageCount: 0 },
];

const useTagStore = create<TagState>()(
  persist(
    (set, get) => ({
      tags: DEFAULT_TAGS.map(tag => ({
        ...tag,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      })),

      addTag: (tag) => {
        const id = crypto.randomUUID();
        set((state) => ({
          tags: [...state.tags, { ...tag, id, usageCount: 0, createdAt: Date.now() }],
        }));
        return id;
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, ...updates } : tag
          ),
        }));
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
        }));
      },

      incrementUsage: (id) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, usageCount: tag.usageCount + 1 } : tag
          ),
        }));
      },

      decrementUsage: (id) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, usageCount: Math.max(0, tag.usageCount - 1) } : tag
          ),
        }));
      },

      getTagById: (id) => {
        return get().tags.find((tag) => tag.id === id);
      },

      getTagsByCategory: (category) => {
        return get().tags.filter((tag) => tag.category === category);
      },

      getMostUsedTags: (limit = 5) => {
        return [...get().tags]
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit);
      },

      searchTags: (query) => {
        const searchTerm = query.toLowerCase();
        return get().tags.filter(
          (tag) =>
            tag.name.toLowerCase().includes(searchTerm) ||
            tag.description?.toLowerCase().includes(searchTerm) ||
            tag.category?.toLowerCase().includes(searchTerm)
        );
      },
    }),
    {
      name: 'onboard-buddy-tags',
    }
  )
);

export default useTagStore;