import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      login: (user, token, refreshToken) => {
        set({ user, token, isLoggedIn: true });
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
      },
      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
