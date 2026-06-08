import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const AUTH_KEY = 'ehr-auth'
const REMEMBER_KEY = 'ehr-remember-me'

/** Uses localStorage when rememberMe is true, sessionStorage otherwise. */
function getAuthStorage() {
  return {
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
  isSessionExpired: boolean
  /** False until persist has rehydrated from storage (avoids redirect to login on F5). */
  _hasHydrated: boolean
  setAuth: (token: string, refreshToken: string | null, user: User, rememberMe?: boolean) => void
  setUser: (user: User) => void
  setRememberMe: (value: boolean) => void
  setHasHydrated: (value: boolean) => void
  setSessionExpired: (value: boolean) => void
  logout: () => void
  isAuthenticated: () => boolean
}

/** Only these fields are persisted (no _hasHydrated or actions). */
type PersistedAuthState = Pick<AuthState, 'token' | 'refreshToken' | 'user' | 'rememberMe'>

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      rememberMe: true,
      isSessionExpired: false,
      _hasHydrated: false,
      setAuth: (token, refreshToken, user, rememberMe) =>
        set((_) => ({ token, refreshToken, user, ...(rememberMe !== undefined ? { rememberMe } : {}) })),
      setUser: (user) => set({ user }),
      setRememberMe: (value) => set({ rememberMe: value }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setSessionExpired: (value) => set({ isSessionExpired: value }),
      logout: () => set({ token: null, refreshToken: null, user: null, isSessionExpired: false }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: AUTH_KEY,
      storage: createJSONStorage(() => getAuthStorage()),
      partialize: (s): PersistedAuthState => ({ token: s.token, refreshToken: s.refreshToken, user: s.user, rememberMe: s.rememberMe }),
      onRehydrateStorage: () => () => {
        useAuthStore.getState().setHasHydrated(true)
      },
    }
  )
)

// Fallback: if onRehydrateStorage never runs (e.g. empty storage or custom sync storage), unblock UI after a short delay
if (typeof window !== 'undefined') {
  window.setTimeout(() => {
    const s = useAuthStore.getState()
    if (!s._hasHydrated) s.setHasHydrated(true)
  }, 300)
}
