import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useMissionStore from './missionStore';
import { ImageStorageService } from '../lib/imageStorage';

export interface GalleryItem {
  id: string;
  type: 'photo' | 'note';
  title: string;
  description: string;
  content: string;
  location?: string;
  date: string;
  tags: string[];
  imageUrl?: string;
  imagePath?: string; // Storage path for cleanup
  altText?: string;
  metadata?: {
    camera?: string;
    settings?: string;
    photographer?: string;
  };
  permissions: {
    public: boolean;
    editable: boolean;
    allowComments: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

interface GalleryState {
  items: GalleryItem[];
  tags: string[];
  addItem: (item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<GalleryItem>) => void;
  deleteItem: (id: string) => void;
  reorderItems: (items: GalleryItem[]) => void;
  addTag: (tag: string) => void;
  updateTag: (oldTag: string, newTag: string) => void;
  deleteTag: (tag: string) => void;
  cleanupImages: () => Promise<void>;
}

const INITIAL_TAGS = ['acronym', 'important', 'follow-up', 'question', 'team'];

const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      items: [],
      tags: INITIAL_TAGS,

      addItem: (item) => {
        const newItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          permissions: {
            public: false,
            editable: true,
            allowComments: true,
            ...item.permissions,
          },
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));

        // Update all missions' progress
        const { missions, updateMissionProgress } = useMissionStore.getState();
        missions.forEach(mission => {
          updateMissionProgress(mission.id);
        });
      },

      updateItem: (id, updates) =>
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id === id) {
              // If image is being updated, clean up old image
              if (updates.imageUrl && updates.imageUrl !== item.imageUrl && item.imagePath) {
                ImageStorageService.deleteImage(item.imagePath).catch(console.error);
              }
              
              return { ...item, ...updates, updatedAt: Date.now() };
            }
            return item;
          });
          
          // Update all missions' progress after tag changes
          const { missions, updateMissionProgress } = useMissionStore.getState();
          missions.forEach(mission => {
            updateMissionProgress(mission.id);
          });
          
          return { items: updatedItems };
        }),

      deleteItem: (id) =>
        set((state) => {
          const itemToDelete = state.items.find(item => item.id === id);
          
          // Clean up image if it exists
          if (itemToDelete?.imagePath) {
            ImageStorageService.deleteImage(itemToDelete.imagePath).catch(console.error);
          }
          
          const updatedItems = state.items.filter((item) => item.id !== id);
          
          // Update all missions' progress after deletion
          const { missions, updateMissionProgress } = useMissionStore.getState();
          missions.forEach(mission => {
            updateMissionProgress(mission.id);
          });
          
          return { items: updatedItems };
        }),

      reorderItems: (items) =>
        set({
          items,
        }),

      addTag: (tag) =>
        set((state) => ({
          tags: [...state.tags, tag],
        })),

      updateTag: (oldTag, newTag) =>
        set((state) => {
          const updatedState = {
            tags: state.tags.map((tag) => (tag === oldTag ? newTag : tag)),
            items: state.items.map((item) => ({
              ...item,
              tags: item.tags.map((tag) => (tag === oldTag ? newTag : tag)),
            })),
          };
          
          // Update all missions' progress after tag changes
          const { missions, updateMissionProgress } = useMissionStore.getState();
          missions.forEach(mission => {
            updateMissionProgress(mission.id);
          });
          
          return updatedState;
        }),

      deleteTag: (tagToDelete) =>
        set((state) => {
          const updatedState = {
            tags: state.tags.filter((tag) => tag !== tagToDelete),
            items: state.items.map((item) => ({
              ...item,
              tags: item.tags.filter((tag) => tag !== tagToDelete),
            })),
          };
          
          // Update all missions' progress after tag deletion
          const { missions, updateMissionProgress } = useMissionStore.getState();
          missions.forEach(mission => {
            updateMissionProgress(mission.id);
          });
          
          return updatedState;
        }),

      cleanupImages: async () => {
        const state = get();
        const activeImagePaths = state.items
          .filter(item => item.imagePath)
          .map(item => item.imagePath!);

        // This would be used to clean up orphaned images
        // Implementation depends on your cleanup strategy
        console.log('Active image paths:', activeImagePaths);
      },
    }),
    {
      name: 'onboard-buddy-gallery',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Add imagePath field to existing items
          const items = (persistedState.items || []).map((item: any) => ({
            ...item,
            imagePath: undefined // Old items won't have storage paths
          }));
          
          return {
            items,
            tags: persistedState.tags || INITIAL_TAGS
          };
        }
        return persistedState as { items: GalleryItem[]; tags: string[] };
      }
    }
  )
);

export default useGalleryStore;