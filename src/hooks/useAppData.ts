import useAuthStore from '../stores/authStore';
import useTaskStore from '../stores/taskStore';
import useGalleryStore from '../stores/galleryStore';
import useDemoStore from '../stores/demoStore';

/**
 * Unified hook that returns the correct data source based on auth mode.
 * Guest users get in-memory demo data; real users get persisted data.
 */
export function useTaskData() {
  const { user } = useAuthStore();
  const isGuest = user?.id === 'demo-user';

  const realStore = useTaskStore();
  const demoStore = useDemoStore();

  if (isGuest) {
    return {
      tasks: demoStore.tasks,
      addTask: demoStore.addTask,
      updateTask: demoStore.updateTask,
      deleteTask: demoStore.deleteTask,
      toggleTaskCompletion: demoStore.toggleTaskCompletion,
    };
  }

  return {
    tasks: realStore.tasks,
    addTask: realStore.addTask,
    updateTask: realStore.updateTask,
    deleteTask: realStore.deleteTask,
    toggleTaskCompletion: realStore.toggleTaskCompletion,
  };
}

export function useGalleryData() {
  const { user } = useAuthStore();
  const isGuest = user?.id === 'demo-user';

  const realStore = useGalleryStore();
  const demoStore = useDemoStore();

  if (isGuest) {
    return {
      items: demoStore.items,
      tags: demoStore.galleryTags,
      addItem: demoStore.addItem,
      updateItem: demoStore.updateItem,
      deleteItem: demoStore.deleteItem,
      addTag: demoStore.addTag,
      // Stubs for demo mode
      updateTag: (_old: string, _new: string) => {},
      deleteTag: (_tag: string) => {},
      reorderItems: (_items: any[]) => {},
      cleanupImages: async () => {},
    };
  }

  return {
    items: realStore.items,
    tags: realStore.tags,
    addItem: realStore.addItem,
    updateItem: realStore.updateItem,
    deleteItem: realStore.deleteItem,
    addTag: realStore.addTag,
    updateTag: realStore.updateTag,
    deleteTag: realStore.deleteTag,
    reorderItems: realStore.reorderItems,
    cleanupImages: realStore.cleanupImages,
  };
}
