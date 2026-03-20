import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FontSizeMode = 'small' | 'medium' | 'large'

const FONT_SIZE_MAP: Record<FontSizeMode, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
}

function applyFontSize(mode: FontSizeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.style.fontSize = FONT_SIZE_MAP[mode]
  document.documentElement.setAttribute('data-font-size', mode)
}

interface FontSizeState {
  mode: FontSizeMode
  setMode: (mode: FontSizeMode) => void
  apply: () => void
}

export const useFontSizeStore = create<FontSizeState>()(
  persist(
    (set, get) => ({
      mode: 'medium',
      setMode: (mode) => {
        set({ mode })
        applyFontSize(mode)
      },
      apply: () => {
        applyFontSize(get().mode)
      },
    }),
    { name: 'ehr-font-size' }
  )
)

