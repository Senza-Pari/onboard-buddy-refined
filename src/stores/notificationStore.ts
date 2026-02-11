import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';
import useTaskStore from './taskStore';
import useMissionStore from './missionStore';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
  read: boolean;
  link?: string;
  dueDate?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  lastNotificationTime: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  checkDueDates: () => void;
}

const MAX_NOTIFICATIONS = 50;
const NOTIFICATION_THROTTLE = 5000; // 5 seconds

const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      lastNotificationTime: 0,

      addNotification: (notification) => {
        const now = Date.now();
        const { lastNotificationTime, notifications } = get();

        // Throttle notifications
        if (now - lastNotificationTime < NOTIFICATION_THROTTLE) {
          return;
        }

        // Check for duplicate notifications within the last minute
        const recentDuplicate = notifications.find(n => 
          n.title === notification.title && 
          n.message === notification.message &&
          now - n.createdAt < 60000
        );

        if (recentDuplicate) {
          return;
        }

        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: now,
          read: false,
        };

        set(state => {
          // Keep only the most recent notifications
          const updatedNotifications = [newNotification, ...state.notifications]
            .slice(0, MAX_NOTIFICATIONS);

          return {
            notifications: updatedNotifications,
            unreadCount: state.unreadCount + 1,
            lastNotificationTime: now,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        const notification = get().notifications.find((n) => n.id === id);
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification && !notification.read 
            ? Math.max(0, state.unreadCount - 1) 
            : state.unreadCount,
        }));
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      checkDueDates: () => {
        const { tasks } = useTaskStore.getState();
        const { missions } = useMissionStore.getState();
        const now = new Date();
        const twoDaysFromNow = addDays(now, 2);

        // Check tasks due soon
        tasks.forEach(task => {
          if (task.completed) return;
          
          const dueDate = parseISO(task.dueDate);
          
          if (isBefore(dueDate, now)) {
            get().addNotification({
              title: 'Task Overdue',
              message: `Task "${task.title}" is past due!`,
              type: 'error',
              link: '/tasks',
              dueDate: task.dueDate
            });
          } else if (isBefore(dueDate, twoDaysFromNow)) {
            get().addNotification({
              title: 'Task Due Soon',
              message: `Task "${task.title}" is due within 48 hours`,
              type: 'warning',
              link: '/tasks',
              dueDate: task.dueDate
            });
          }
        });

        // Check missions due soon
        missions.forEach(mission => {
          if (mission.completed || !mission.deadline) return;
          
          const deadline = parseISO(mission.deadline);
          
          if (isBefore(deadline, now)) {
            get().addNotification({
              title: 'Mission Overdue',
              message: `Mission "${mission.title}" has passed its deadline!`,
              type: 'error',
              link: '/missions',
              dueDate: mission.deadline
            });
          } else if (isBefore(deadline, twoDaysFromNow)) {
            get().addNotification({
              title: 'Mission Due Soon',
              message: `Mission "${mission.title}" deadline is approaching`,
              type: 'warning',
              link: '/missions',
              dueDate: mission.deadline
            });
          }
        });
      },
    }),
    {
      name: 'onboard-buddy-notifications',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            notifications: [],
            unreadCount: 0,
            lastNotificationTime: 0
          };
        }
        return persistedState as NotificationState;
      }
    }
  )
);

// Check due dates less frequently
setInterval(() => {
  useNotificationStore.getState().checkDueDates();
}, 5 * 60 * 1000); // Check every 5 minutes

export default useNotificationStore;