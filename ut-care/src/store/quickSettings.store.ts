import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QuickSettingsState {
  showTheme: boolean
  showLanguage: boolean
  showFontSize: boolean
  showHeaderBarMode: boolean
  setShowTheme: (v: boolean) => void
  setShowLanguage: (v: boolean) => void
  setShowFontSize: (v: boolean) => void
  setShowHeaderBarMode: (v: boolean) => void
}

export const useQuickSettingsStore = create<QuickSettingsState>()(
  persist(
    (set) => ({
      showTheme: true,
      showLanguage: true,
      showFontSize: false,
      showHeaderBarMode: false,
      setShowTheme: (v) => set({ showTheme: v }),
      setShowLanguage: (v) => set({ showLanguage: v }),
      setShowFontSize: (v) => set({ showFontSize: v }),
      setShowHeaderBarMode: (v) => set({ showHeaderBarMode: v }),
    }),
    { name: 'ehr-quick-settings-visibility' }
  )
)
