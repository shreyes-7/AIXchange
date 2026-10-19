import { createSlice } from '@reduxjs/toolkit';

const token = typeof window !== 'undefined' ? localStorage.getItem('aix_token') : null;
let savedUser = null;
let savedRole = 'guest';

try {
  const userJson = typeof window !== 'undefined' ? localStorage.getItem('aix_user') : null;
  if (userJson) {
    savedUser = JSON.parse(userJson);
    savedRole = savedUser?.role || localStorage.getItem('aix_role') || 'consumer';
  }
} catch {
  savedUser = null;
}

const initialState = {
  user: savedUser,
  token,
  isAuthenticated: !!token && !!savedUser,
  role: savedRole,
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
      if (user) {
        localStorage.setItem('aix_user', JSON.stringify(user));
        localStorage.setItem('aix_role', state.role);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = 'guest';
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('aix_token');
      localStorage.removeItem('aix_user');
      localStorage.removeItem('aix_role');
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
