import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DATE_FORMAT_OPTIONS = ['short', 'medium', 'long'] as const
export type StatusBarDateFormat = (typeof DATE_FORMAT_OPTIONS)[number]

export interface StatusBarElementsState {
  showUserName: boolean
  showRole: boolean
  showTime: boolean
  showDate: boolean
  showTemperature: boolean
  showSettings: boolean
  dateFormat: StatusBarDateFormat
  setShowUserName: (v: boolean) => void
  setShowRole: (v: boolean) => void
  setShowTime: (v: boolean) => void
  setShowDate: (v: boolean) => void
  setShowTemperature: (v: boolean) => void
  setShowSettings: (v: boolean) => void
  setDateFormat: (v: StatusBarDateFormat) => void
}

const defaultState = {
  showUserName: true,
  showRole: true,
  showTime: true,
  showDate: true,
  showTemperature: true,
  showSettings: true,
  dateFormat: 'medium' as StatusBarDateFormat,
}

export const useStatusBarElementsStore = create<StatusBarElementsState>()(
  persist(
    (set) => ({
      ...defaultState,
      setShowUserName: (v) => set({ showUserName: v }),
      setShowRole: (v) => set({ showRole: v }),
      setShowTime: (v) => set({ showTime: v }),
      setShowDate: (v) => set({ showDate: v }),
      setShowTemperature: (v) => set({ showTemperature: v }),
      setShowSettings: (v) => set({ showSettings: v }),
      setDateFormat: (v) => set({ dateFormat: v }),
    }),
    { name: 'ehr-status-bar-elements' }
  )
)

/** Intl.DateTimeFormat options for date only, by format key. */
export function getDateFormatOptions(
  format: StatusBarDateFormat
): Intl.DateTimeFormatOptions {
  switch (format) {
    case 'short':
      return { day: '2-digit', month: '2-digit', year: 'numeric' }
    case 'long':
      return {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    case 'medium':
    default:
      return {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
  }
}
