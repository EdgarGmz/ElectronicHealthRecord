import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const HEADER_BAR_MODES = ['always', 'hide-on-scroll'] as const
export type HeaderBarMode = (typeof HEADER_BAR_MODES)[number]

function isValidMode(m: string): m is HeaderBarMode {
  return HEADER_BAR_MODES.includes(m as HeaderBarMode)
}

interface HeaderBarState {
  mode: HeaderBarMode
  setMode: (mode: HeaderBarMode) => void
}

export const useHeaderBarStore = create<HeaderBarState>()(
  persist(
    (set) => ({
      mode: 'hide-on-scroll',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'ehr-header-bar',
      partialize: (state) => ({ mode: isValidMode(state.mode) ? state.mode : 'hide-on-scroll' }),
    }
  )
)
