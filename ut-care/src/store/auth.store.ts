import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const AUTH_KEY = 'ehr-auth'
const REMEMBER_KEY = 'ehr-remember-me'

/** Storage that uses localStorage when rememberMe is true, sessionStorage otherwise. */
const authStorage = {
  getItem: (name: string): string | null => {
    const remember = localStorage.getItem(REMEMBER_KEY)
    const storage = remember === 'false' ? sessionStorage : localStorage
    return storage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value) as { state?: { rememberMe?: boolean } }
      const remember = parsed?.state?.rememberMe !== false
      localStorage.setItem(REMEMBER_KEY, String(remember))
      if (remember) {
        localStorage.setItem(name, value)
        sessionStorage.removeItem(name)
      } else {
        sessionStorage.setItem(name, value)
        localStorage.removeItem(name)
      }
    } catch {
      localStorage.setItem(name, value)
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(REMEMBER_KEY)
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  },
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive?: boolean
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  rememberMe: boolean
  /** False until persist has rehydrated from storage (avoids redirect to login on F5). */
  _hasHydrated: boolean
  setAuth: (token: string, refreshToken: string | null, user: User, rememberMe?: boolean) => void
  setUser: (user: User) => void
  setRememberMe: (value: boolean) => void
  setHasHydrated: (value: boolean) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      rememberMe: true,
      _hasHydrated: false,
      setAuth: (token, refreshToken, user, rememberMe) =>
        set((s) => ({ token, refreshToken, user, ...(rememberMe !== undefined ? { rememberMe } : {}) })),
      setUser: (user) => set({ user }),
      setRememberMe: (value) => set({ rememberMe: value }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      logout: () => set({ token: null, refreshToken: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: AUTH_KEY,
      storage: authStorage,
      partialize: (s) => ({ token: s.token, refreshToken: s.refreshToken, user: s.user, rememberMe: s.rememberMe }),
      onRehydrateStorage: () => () => {
        useAuthStore.getState().setHasHydrated(true)
      },
    }
  )
)
