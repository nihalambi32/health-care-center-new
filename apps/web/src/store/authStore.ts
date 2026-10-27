import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { setAccessToken } from '../lib/apiClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setToken: (token) => {
        setAccessToken(token);
      },
      logout: () => {
        setAccessToken(null);
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'dhc-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
