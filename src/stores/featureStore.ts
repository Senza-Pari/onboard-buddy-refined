import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeatureKey =
  | 'tasks'
  | 'missions'
  | 'people'
  | 'journal'
  | 'buddyChat'
  | 'export'
  | 'templates'
  | 'shareJourney'
  | 'aiTaskSuggestions'
  | 'milestoneCelebrations'
  | 'whatToDoNow'
  | 'overdueWarnings'
  | 'premiumPrompts';

export interface FeatureConfig {
  enabled: boolean;
  label: string;
  category: 'core' | 'addon';
  description: string;
}

interface FeatureState {
  features: Record<FeatureKey, FeatureConfig>;
  toggleFeature: (key: FeatureKey) => void;
  isEnabled: (key: FeatureKey) => boolean;
}

const defaultFeatures: Record<FeatureKey, FeatureConfig> = {
  tasks: {
    enabled: true,
    label: 'Tasks',
    category: 'core',
    description: 'Task management with due dates, priorities, and department tagging.',
  },
  missions: {
    enabled: true,
    label: 'Missions',
    category: 'core',
    description: 'Goal-based missions that track progress across multiple tasks.',
  },
  people: {
    enabled: true,
    label: 'People / Meet & Greet',
    category: 'core',
    description: 'Track colleagues, schedule meetings, and take notes.',
  },
  journal: {
    enabled: true,
    label: 'Journal / Gallery',
    category: 'core',
    description: 'Daily journal entries with photos to document the onboarding journey.',
  },
  buddyChat: {
    enabled: true,
    label: 'Buddy AI Chat',
    category: 'addon',
    description: 'AI-powered onboarding assistant for questions and guidance.',
  },
  export: {
    enabled: true,
    label: 'Export / PDF',
    category: 'addon',
    description: 'Export onboarding progress as a PDF report.',
  },
  templates: {
    enabled: true,
    label: 'Templates',
    category: 'addon',
    description: 'Pre-built onboarding templates for different roles.',
  },
  shareJourney: {
    enabled: true,
    label: 'Share Journey',
    category: 'addon',
    description: 'Generate a shareable link to show progress to managers.',
  },
  aiTaskSuggestions: {
    enabled: true,
    label: 'AI Task Suggestions',
    category: 'addon',
    description: 'Get AI-generated task recommendations based on your role.',
  },
  milestoneCelebrations: {
    enabled: true,
    label: 'Milestone Celebrations',
    category: 'addon',
    description: 'Confetti and celebration moments at 25%, 50%, 75%, and 100% progress.',
  },
  whatToDoNow: {
    enabled: true,
    label: '"What To Do Now" Card',
    category: 'addon',
    description: 'Priority card showing the single most urgent task on the dashboard.',
  },
  overdueWarnings: {
    enabled: true,
    label: 'Overdue Warnings',
    category: 'addon',
    description: 'Red badges and sorting for tasks past their due date.',
  },
  premiumPrompts: {
    enabled: true,
    label: 'Premium / Upgrade Prompts',
    category: 'addon',
    description: 'Banners and pop-ups promoting premium upgrades and pricing.',
  },
};

const useFeatureStore = create<FeatureState>()(
  persist(
    (set, get) => ({
      features: defaultFeatures,
      toggleFeature: (key) =>
        set((state) => ({
          features: {
            ...state.features,
            [key]: {
              ...state.features[key],
              enabled: !state.features[key].enabled,
            },
          },
        })),
      isEnabled: (key) => get().features[key]?.enabled ?? true,
    }),
    {
      name: 'onboard-buddy-features',
      version: 1,
    }
  )
);

export default useFeatureStore;
