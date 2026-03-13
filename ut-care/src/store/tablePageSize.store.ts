import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const TABLE_PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const
export type TablePageSize = (typeof TABLE_PAGE_SIZE_OPTIONS)[number]

function isValidPageSize(n: number): n is TablePageSize {
  return TABLE_PAGE_SIZE_OPTIONS.includes(n as TablePageSize)
}

interface TablePageSizeState {
  defaultLimit: TablePageSize
  setDefaultLimit: (limit: TablePageSize) => void
}

export const useTablePageSizeStore = create<TablePageSizeState>()(
  persist(
    (set) => ({
      defaultLimit: 10,
      setDefaultLimit: (limit) => set({ defaultLimit: limit }),
    }),
    {
      name: 'ehr-table-page-size',
      // Guard: only persist if value is one of 5, 10, 15, 20
      partialize: (state) => ({ defaultLimit: isValidPageSize(state.defaultLimit) ? state.defaultLimit : 10 }),
    }
  )
)

/** Initial limit for paginated tables (from settings). Use in useState(…) for first mount. */
export function getDefaultTableLimit(): number {
  const n = useTablePageSizeStore.getState().defaultLimit
  return isValidPageSize(n) ? n : 10
}
