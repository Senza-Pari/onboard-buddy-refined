import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ImageStorageService } from '../lib/imageStorage';

interface UploadedImage {
  id: string;
  url: string;
  path: string;
  createdAt: number;
}

interface ImageState {
  profilePhoto: string | null;
  profilePhotoPath: string | null;
  welcomeBackground: string;
  welcomeBackgroundPath: string | null;
  uploadedImages: UploadedImage[];
  setProfilePhoto: (url: string | null, path?: string | null) => void;
  setWelcomeBackground: (url: string | null, path?: string | null) => void;
  addUploadedImage: (id: string, url: string, path: string) => void;
  removeUploadedImage: (id: string) => Promise<void>;
  cleanupOrphanedImages: () => Promise<void>;
}

const DEFAULT_WELCOME_BACKGROUND =
  'https://cameronstewart.click/onboardingbuddy/onboarding-buddy-cover-image.jpg';

const useImageStore = create<ImageState>()(
  persist(
    (set, get) => ({
      profilePhoto: null,
      profilePhotoPath: null,
      welcomeBackground: DEFAULT_WELCOME_BACKGROUND,
      welcomeBackgroundPath: null,
      uploadedImages: [],

      setProfilePhoto: (url: string | null, path?: string | null) => {
        const state = get();
        
        // Clean up old profile photo if it exists
        if (state.profilePhotoPath && url !== state.profilePhoto) {
          ImageStorageService.deleteImage(state.profilePhotoPath).catch(console.error);
        }
        
        set({ 
          profilePhoto: url,
          profilePhotoPath: path || null
        });
      },

      setWelcomeBackground: (url: string | null, path?: string | null) => {
        const state = get();
        
        // Clean up old background if it exists and it's not the default
        if (state.welcomeBackgroundPath && url !== state.welcomeBackground) {
          ImageStorageService.deleteImage(state.welcomeBackgroundPath).catch(console.error);
        }
        
        set({ 
          welcomeBackground: url ?? DEFAULT_WELCOME_BACKGROUND,
          welcomeBackgroundPath: path || null
        });
      },

      addUploadedImage: (id: string, url: string, path: string) => {
        const newImage: UploadedImage = {
          id,
          url,
          path,
          createdAt: Date.now(),
        };
        set((state) => ({
          uploadedImages: [...state.uploadedImages, newImage],
        }));
      },

      removeUploadedImage: async (id: string) => {
        const state = get();
        const image = state.uploadedImages.find(img => img.id === id);
        
        if (image) {
          // Delete from storage
          await ImageStorageService.deleteImage(image.path);
          
          // Remove from state
          set((state) => ({
            uploadedImages: state.uploadedImages.filter((img) => img.id !== id),
          }));
        }
      },

      cleanupOrphanedImages: async () => {
        const state = get();
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        // Find images older than a week that might be orphaned
        const oldImages = state.uploadedImages.filter(img => img.createdAt < oneWeekAgo);
        
        for (const image of oldImages) {
          try {
            await ImageStorageService.deleteImage(image.path);
            console.log('Cleaned up orphaned image:', image.path);
          } catch (error) {
            console.error('Failed to cleanup image:', image.path, error);
          }
        }
        
        // Remove cleaned up images from state
        set((state) => ({
          uploadedImages: state.uploadedImages.filter(img => img.createdAt >= oneWeekAgo)
        }));
      },
    }),
    {
      name: 'onboard-buddy-images',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            profilePhoto: persistedState.profilePhoto || null,
            profilePhotoPath: null,
            welcomeBackground: persistedState.welcomeBackground || DEFAULT_WELCOME_BACKGROUND,
            welcomeBackgroundPath: null,
            uploadedImages: persistedState.uploadedImages || []
          };
        }
        return persistedState as ImageState;
      }
    }
  )
);

export default useImageStore;