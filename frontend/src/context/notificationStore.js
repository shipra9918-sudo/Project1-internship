import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  // Add a notification
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Mark notification as read
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
      unreadCount: 0,
    }));
  },

  // Remove a notification
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
      unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
    }));
  },

  // Clear all notifications
  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

export default useNotificationStore;
