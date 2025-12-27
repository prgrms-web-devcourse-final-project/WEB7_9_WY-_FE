import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notificationApi } from '@/api/client';
import { mapNotificationsPage } from '@/lib/notificationMapper';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
}

interface NotificationActions {
  // Local actions (기존)
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearAllNotifications: () => void;
  getUnreadNotifications: () => Notification[];

  // API actions (신규)
  fetchNotifications: (page?: number) => Promise<void>;
  fetchMoreNotifications: () => Promise<void>;
  syncMarkAllAsRead: () => Promise<void>;
  setNotifications: (notifications: Notification[]) => void;
  updateUnreadCount: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      hasMore: true,
      currentPage: 0,

      // ===== 기존 Local Actions =====
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
        }));
      },

      markAsRead: (id: number) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id: number) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.read);
      },

      // ===== 신규 API Actions =====
      fetchNotifications: async (page = 0) => {
        set({ isLoading: true });
        try {
          const { data, error } = await notificationApi.getNotifications({
            page,
            size: 20,
          });

          if (error) {
            console.error('[NotificationStore] Failed to fetch notifications:', error);
            return;
          }

          if (data) {
            const content = data.content || [];
            const mapped = mapNotificationsPage(content);

            set((state) => ({
              notifications: page === 0 ? mapped : [...state.notifications, ...mapped],
              hasMore: !data.last,
              currentPage: page,
            }));
            get().updateUnreadCount();
          }
        } catch (error) {
          console.error('[NotificationStore] Failed to fetch notifications:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMoreNotifications: async () => {
        const { hasMore, isLoading, currentPage } = get();
        if (!hasMore || isLoading) return;

        await get().fetchNotifications(currentPage + 1);
      },

      syncMarkAllAsRead: async () => {
        try {
          const { error } = await notificationApi.markAllAsRead();
          if (!error) {
            get().markAllAsRead();
          }
        } catch (error) {
          console.error('[NotificationStore] Failed to mark all as read:', error);
        }
      },

      setNotifications: (notifications) => {
        set({ notifications });
        get().updateUnreadCount();
      },

      updateUnreadCount: () => {
        const unread = get().notifications.filter((n) => !n.read).length;
        set({ unreadCount: unread });
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        // 로딩 상태는 persist하지 않음
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
