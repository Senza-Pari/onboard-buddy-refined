import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

interface Layout {
  sidebarWidth: number;
  contentMaxWidth: number;
  spacing: number;
}

interface Settings {
  theme: Theme;
  layout: Layout;
  customTexts: Record<string, string>;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  preferences: {
    autoSave: boolean;
    showTips: boolean;
    compactMode: boolean;
  };
}

interface SettingsState extends Settings {
  updateTheme: (theme: Partial<Theme>) => void;
  updateLayout: (layout: Partial<Layout>) => void;
  updateCustomText: (key: string, value: string) => void;
  updateNotifications: (notifications: Partial<Settings['notifications']>) => void;
  updatePreferences: (preferences: Partial<Settings['preferences']>) => void;
  resetToDefault: () => void;
}

const defaultSettings: Settings = {
  theme: {
    primary: '#39e079',
    secondary: '#f0f2f5',
    background: '#ffffff',
    text: '#111418',
    accent: '#0c7ff2',
  },
  layout: {
    sidebarWidth: 256,
    contentMaxWidth: 1280,
    spacing: 16,
  },
  customTexts: {},
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
  },
  preferences: {
    autoSave: true,
    showTips: true,
    compactMode: false,
  },
};

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateTheme: (theme) =>
        set((state) => ({
          theme: { ...state.theme, ...theme },
        })),
      
      updateLayout: (layout) =>
        set((state) => ({
          layout: { ...state.layout, ...layout },
        })),
      
      updateCustomText: (key, value) =>
        set((state) => ({
          customTexts: { ...state.customTexts, [key]: value },
        })),
      
      updateNotifications: (notifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notifications },
        })),
      
      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),
      
      resetToDefault: () => set(defaultSettings),
    }),
    {
      name: 'onboard-buddy-settings',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return defaultSettings;
        }
        return persistedState as Settings;
      }
    }
  )
);

export default useSettingsStore;