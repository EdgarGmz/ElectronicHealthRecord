import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'auto-shift' | 'auto-system'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getShiftTheme(): 'light' | 'dark' {
  const hour = new Date().getHours()
  return hour >= 18 || hour < 6 ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  switch (mode) {
    case 'light':
      return 'light'
    case 'dark':
      return 'dark'
    case 'auto-system':
      return getSystemTheme()
    case 'auto-shift':
    default:
      return getShiftTheme()
  }
}

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  apply: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'auto-system',
      setMode: (mode) => {
        set({ mode })
        const resolved = resolveTheme(mode)
        applyTheme(resolved)
      },
      apply: () => {
        const resolved = resolveTheme(get().mode)
        applyTheme(resolved)
      },
    }),
    { name: 'ehr-theme' }
  )
)

if (typeof window !== 'undefined') {
  useThemeStore.getState().apply()
  setInterval(() => {
    const { mode } = useThemeStore.getState()
    if (mode === 'auto-shift' || mode === 'auto-system') useThemeStore.getState().apply()
  }, 60000)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { mode } = useThemeStore.getState()
    if (mode === 'auto-system') useThemeStore.getState().apply()
  })
}
