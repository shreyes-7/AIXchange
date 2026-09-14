import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const id = Date.now().toString();
      state.notifications.unshift({
        id,
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      });
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
