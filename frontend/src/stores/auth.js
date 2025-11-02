import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
          const { user, token } = res.data;
          set({ user, token, isLoading: false });
          localStorage.setItem('token', token);
          return { success: true };
        } catch (err) {
          const error = err.response?.data?.error || 'Login failed';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password, role });
          const { user, token } = res.data;
          set({ user, token, isLoading: false });
          localStorage.setItem('token', token);
          return { success: true };
        } catch (err) {
          const error = err.response?.data?.error || 'Registration failed';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        try {
          const res = await axios.get(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: res.data.user, token });
        } catch {
          // Token invalid, logout
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
