import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';
import useGalleryStore from './galleryStore';
import useNotificationStore from './notificationStore';

// Core missions that appear in the main Missions page
const INITIAL_MISSIONS = [
  {
    id: 'onboarding-basics',
    title: 'Complete Onboarding Basics',
    description: 'Complete the essential onboarding tasks and documentation',
    requirements: [
      { tag: 'admin', count: 2, current: 0 },
      { tag: 'hr', count: 2, current: 0 }
    ],
    deadline: undefined,
    progress: 0,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reward: { type: 'badge' as const, value: 'Onboarding Pro' }
  },
  {
    id: 'team-connect',
    title: 'Team Connection',
    description: 'Meet key team members and establish connections',
    requirements: [
      { tag: 'team', count: 3, current: 0 },
      { tag: 'meetings', count: 2, current: 0 }
    ],
    deadline: undefined,
    progress: 0,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reward: { type: 'badge' as const, value: 'Team Player' }
  },
  {
    id: 'workspace-setup',
    title: 'Workspace Setup',
    description: 'Set up and customize your work environment',
    requirements: [
      { tag: 'setup', count: 2, current: 0 },
      { tag: 'equipment', count: 1, current: 0 }
    ],
    deadline: undefined,
    progress: 0,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reward: { type: 'points' as const, value: 100 }
  }
];

export interface MissionRequirement {
  tag: string;
  count: number;
  current: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  requirements: MissionRequirement[];
  deadline?: string;
  link?: string;
  progress: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  reward: {
    type: 'points' | 'badge' | 'achievement';
    value: number | string;
  };
}

interface MissionState {
  missions: Mission[];
  addMission: (mission: Omit<Mission, 'id' | 'progress' | 'completed' | 'createdAt' | 'updatedAt'>) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  updateMissionProgress: (missionId: string) => void;
  validateMission: (mission: Partial<Mission>) => string[];
}

const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      missions: INITIAL_MISSIONS,

      validateMission: (mission) => {
        const errors: string[] = [];

        if (!mission.title?.trim()) {
          errors.push('Title is required');
        }

        if (!mission.description?.trim()) {
          errors.push('Description is required');
        }

        if (!mission.requirements?.length) {
          errors.push('At least one tag requirement is required');
        } else {
          mission.requirements.forEach((req, index) => {
            if (!req.tag) {
              errors.push(`Tag is required for requirement #${index + 1}`);
            }
            if (!req.count || req.count < 1) {
              errors.push(`Count must be at least 1 for requirement #${index + 1}`);
            }
          });
        }

        if (mission.deadline) {
          const deadline = parseISO(mission.deadline);
          const now = new Date();
          const maxDate = addDays(now, 90);

          if (isBefore(deadline, now)) {
            errors.push('Deadline cannot be in the past');
          }
          if (isAfter(deadline, maxDate)) {
            errors.push('Deadline cannot be more than 90 days in the future');
          }
        }

        if (mission.link) {
          try {
            new URL(mission.link);
          } catch {
            errors.push('Link must be a valid URL');
          }
        }

        return errors;
      },

      addMission: (mission) => {
        const errors = get().validateMission(mission);
        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }

        const newMission: Mission = {
          ...mission,
          id: crypto.randomUUID(),
          progress: 0,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          requirements: mission.requirements.map(req => ({
            ...req,
            current: 0
          }))
        };

        set(state => ({
          missions: [...state.missions, newMission]
        }));

        const { addNotification } = useNotificationStore.getState();
        addNotification({
          title: 'New Mission Available',
          message: `Mission "${newMission.title}" has been added to your journey.`,
          type: 'info',
          link: '/missions'
        });

        get().updateMissionProgress(newMission.id);
      },

      updateMission: (id, updates) => {
        const mission = get().missions.find(m => m.id === id);
        if (!mission) return;

        const updatedMission = { ...mission, ...updates };
        const errors = get().validateMission(updatedMission);
        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }

        set(state => ({
          missions: state.missions.map(m =>
            m.id === id
              ? { ...m, ...updates, updatedAt: new Date().toISOString() }
              : m
          )
        }));

        get().updateMissionProgress(id);
      },

      deleteMission: (id) => {
        set(state => ({
          missions: state.missions.filter(m => m.id !== id)
        }));
      },

      updateMissionProgress: (missionId) => {
        const mission = get().missions.find(m => m.id === missionId);
        if (!mission) return;

        const { items } = useGalleryStore.getState();
        
        const updatedRequirements = mission.requirements.map(req => ({
          ...req,
          current: items.filter(item => item.tags.includes(req.tag)).length
        }));

        const totalRequired = mission.requirements.reduce((sum, req) => sum + req.count, 0);
        const totalCurrent = updatedRequirements.reduce((sum, req) => sum + Math.min(req.current, req.count), 0);
        const progress = Math.min((totalCurrent / totalRequired) * 100, 100);
        
        const completed = updatedRequirements.every(req => req.current >= req.count);

        const wasCompleted = mission.completed;
        const isNewlyCompleted = completed && !wasCompleted;

        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId
              ? {
                  ...m,
                  requirements: updatedRequirements,
                  progress,
                  completed,
                  updatedAt: new Date().toISOString()
                }
              : m
          )
        }));

        if (isNewlyCompleted) {
          const { addNotification } = useNotificationStore.getState();
          addNotification({
            title: 'Mission Completed! 🎉',
            message: `Congratulations! You've completed the mission "${mission.title}"`,
            type: 'success',
            link: '/missions'
          });
        }
      }
    }),
    {
      name: 'onboard-buddy-missions',
      version: 1,
      skipHydration: false,
      partialize: (state) => ({ missions: state.missions }),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migration from version 0 to version 1
          return {
            missions: persistedState.missions || INITIAL_MISSIONS
          };
        }
        return persistedState as { missions: Mission[] };
      }
    }
  )
);

export default useMissionStore;