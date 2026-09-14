import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import notificationReducer from './slices/notificationSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    notification: notificationReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
