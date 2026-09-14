import { createSlice } from '@reduxjs/toolkit';

const token = typeof window !== 'undefined' ? localStorage.getItem('aix_token') : null;

const initialState = {
  user: null,
  token,
  isAuthenticated: !!token,
  role: 'guest',
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role || user?.role || 'consumer';
      state.isAuthenticated = true;
      state.error = null;
      if (token) {
        localStorage.setItem('aix_token', token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = 'guest';
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('aix_token');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export const loginSuccess = setCredentials;
export default authSlice.reducer;
