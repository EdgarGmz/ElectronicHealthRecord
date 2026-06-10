import { type ReactNode, useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FilterX,
  FileText,
  FileSpreadsheet,
  FileDown,
  Search,
  X,
} from 'lucide-react'
import { GlassButton } from '@/components/atoms/GlassButton'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { PasswordInput } from '@/components/atoms/PasswordInput'
import { getTableRowClass, getStatusBadgeClass } from '@/utils/tableRowColors'
import type { TableRowVariant } from '@/utils/tableRowColors'
import {
  exportTableToCsv,
  exportTableToXlsx,
  exportTableToPdf,
} from '@/utils/tableExport'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

export interface DataTableFilterConfig {
  key: string
  label: string
  type: 'select' | 'text' | 'date'
  options?: { value: string; label: string }[]
  placeholder?: string
  /** Para type 'text': mostrar icono de búsqueda. */
  searchIcon?: boolean
  /** Para type 'text': retraso en ms antes de aplicar (evita solicitudes por cada tecla). Ej. 350. */
  debounceMs?: number
}

export interface DataTableColumn<T> {
  id: string
  label: string
  /** Valor para ordenamiento y export (texto). */
  getValue: (row: T) => string | number
  /** Render opcional; si no se usa, se muestra getValue o badge de estado. */
  render?: (row: T) => ReactNode
  sortable?: boolean
  type?: 'text' | 'status' | 'date' | 'datetime'
  /** Para type 'status': valor -> success | warning | error. */
  statusMap?: Record<string, 'success' | 'warning' | 'error'>
  width?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  loading: boolean
  error: string | null
  emptyMessage: string
  pagination: { page: number; limit: number; total: number; totalPages: number }
  onPageChange: (page: number) => void
  /** Si se define, se muestra selector de elementos por página (5, 10, 15, 20). */
  onLimitChange?: (limit: number) => void
  filters?: DataTableFilterConfig[]
  filterValues: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
  onSort?: (columnId: string, order: 'asc' | 'desc') => void
  sortState?: { columnId: string | null; order: 'asc' | 'desc' }
  renderActions: (row: T) => ReactNode
  /** Variante de fila por contexto (verde/amarillo/rojo). */
  rowVariant?: (row: T) => TableRowVariant
  /** Clase CSS personalizada por fila (ej. bitácora por tipo de acción). */
  rowClassName?: (row: T) => string
  /** Evento opcional al hacer clic en una fila */
  onRowClick?: (row: T, event: React.MouseEvent) => void
  /** Formatos de exportación mostrados. */
  exportFormats?: ('pdf' | 'csv' | 'xlsx')[]
  exportFilename?: string
  exportTitle?: string
  i18n?: {
    actions?: string
    clearFilters?: string
    export?: string
    exportPdf?: string
    exportCsv?: string
    exportExcel?: string
    previous?: string
    next?: string
    page?: string
    of?: string
    all?: string
    rowsPerPage?: string
  }
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const
const DEFAULT_SEARCH_DEBOUNCE_MS = 350

function hasActiveFilters(filterValues: Record<string, string>): boolean {
  return Object.values(filterValues).some((v) => v !== '' && v != null)
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  loading,
  error: _error,
  emptyMessage,
  pagination,
  onPageChange,
  onLimitChange,
  filters = [],
  filterValues,
  onFilterChange,
  onClearFilters,
  onSort,
  sortState,
  renderActions,
  rowVariant,
  rowClassName,
  onRowClick,
  exportFormats = ['pdf', 'csv', 'xlsx'],
  exportFilename = 'datos',
  exportTitle,
  i18n = {},
}: DataTableProps<T>) {
  void _error
  const currentUser = useAuthStore((s) => s.user)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'csv' | 'xlsx' | null>(null)
  const [exportPassword, setExportPassword] = useState('')
  const [exportPasswordError, setExportPasswordError] = useState<string | null>(null)
  const [exportVerifying, setExportVerifying] = useState(false)
  const [localTextValues, setLocalTextValues] = useState<Record<string, string>>({})
  const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const prevFilterValuesRef = useRef<string>('')

  useEffect(() => {
    const str = JSON.stringify(filterValues)
    if (prevFilterValuesRef.current !== str) {
      prevFilterValuesRef.current = str
      setLocalTextValues((prev) => ({ ...prev, ...filterValues }))
    }
  }, [filterValues])

  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(clearTimeout)
    }
  }, [])

  const handleTextFilterChange = useCallback(
    (key: string, value: string, debounceMs?: number) => {
      setLocalTextValues((prev) => ({ ...prev, [key]: value }))
      if (debounceTimersRef.current[key]) {
        clearTimeout(debounceTimersRef.current[key])
        delete debounceTimersRef.current[key]
      }
      if (value === '' || debounceMs == null || debounceMs <= 0) {
        onFilterChange(key, value)
      } else {
        debounceTimersRef.current[key] = setTimeout(() => {
          onFilterChange(key, value)
          delete debounceTimersRef.current[key]
        }, debounceMs)
      }
    },
    [onFilterChange]
  )

  const t = i18n
  const activeFilters = hasActiveFilters(filterValues)

  const handleExport = (format: 'pdf' | 'csv' | 'xlsx') => {
    const headers = columns.map((c) => c.label)
    const rows = data.map((row) =>
      columns.map((col) => String(col.getValue(row) ?? ''))
    )
    if (format === 'csv') exportTableToCsv(headers, rows, exportFilename)
    else if (format === 'xlsx') exportTableToXlsx(headers, rows, exportFilename)
    else exportTableToPdf(headers, rows, exportFilename, exportTitle)
  }

  const openExportModal = (format: 'pdf' | 'csv' | 'xlsx') => {
    if (!data.length) return
    setPendingFormat(format)
    setExportPassword('')
    setExportPasswordError(null)
    setExportModalOpen(true)
  }

  const handleConfirmExport = async () => {
    if (!pendingFormat) return
    if (!currentUser?.email) {
      setExportPasswordError('No hay usuario en sesión')
      return
    }
    if (!exportPassword) {
      setExportPasswordError('La contraseña es requerida')
      return
    }
    setExportVerifying(true)
    setExportPasswordError(null)
    try {
      // Validar credenciales antes de exportar
      await api.post('/auth/login', {
        email: currentUser.email,
        password: exportPassword,
      })
      handleExport(pendingFormat)
      setExportModalOpen(false)
      setExportPassword('')
      setPendingFormat(null)
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setExportPasswordError(msg || 'Credenciales inválidas')
    } finally {
      setExportVerifying(false)
    }
  }

  const renderCell = (col: DataTableColumn<T>, row: T): ReactNode => {
    if (col.render) return col.render(row)
    const value = col.getValue(row)
    const str = String(value ?? '')
    if (col.type === 'status' && col.statusMap) {
      const variant = col.statusMap[str] ?? 'warning'
      return (
        <span className={getStatusBadgeClass(variant)}>{str || '—'}</span>
      )
    }
    return <span className="text-[var(--text-secondary)]">{str || '—'}</span>
  }

  /* No devolver null con loading/error: así los filtros (input de búsqueda) siguen montados
   * y no se pierde el foco al actualizar los datos. */
  return (
    <div className="space-y-4">
      <ConfirmModal
        open={exportModalOpen}
        onClose={() => {
          if (exportVerifying) return
          setExportModalOpen(false)
        }}
        onConfirm={handleConfirmExport}
        confirming={exportVerifying}
        title="Confirmar descarga"
        message="Por seguridad, introduce tu contraseña para exportar estos datos."
        detail={
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Contraseña
            </label>
            <PasswordInput
              value={exportPassword}
              onChange={(e) => {
                setExportPassword(e.target.value)
                setExportPasswordError(null)
              }}
              placeholder="********"
            />
            {exportPasswordError && (
              <p className="text-xs text-[var(--color-error)]">{exportPasswordError}</p>
            )}
          </div>
        }
      />
      {/* Filtros + Limpiar + Export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          {filters.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                {f.label}
              </label>
              {f.type === 'select' ? (
                <select
                  value={filterValues[f.key] ?? ''}
                  onChange={(e) => onFilterChange(f.key, e.target.value)}
                  className="glass-input w-full min-w-[140px] px-3 py-2 text-sm sm:w-auto"
                >
                  <option value="">{t.all ?? 'Todos'}</option>
                  {(f.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : f.type === 'date' ? (
                <input
                  type="date"
                  value={filterValues[f.key] ?? ''}
                  onChange={(e) => onFilterChange(f.key, e.target.value)}
                  className="glass-input w-full min-w-[140px] px-3 py-2 text-sm sm:w-auto"
                />
              ) : (
                <div className="relative flex min-w-[200px] items-center sm:w-auto">
                  {f.searchIcon && (
                    <Search
                      size={16}
                      className="absolute left-3 pointer-events-none text-[var(--text-muted)]"
                      aria-hidden
                    />
                  )}
                  <input
                    type="search"
                    value={localTextValues[f.key] ?? filterValues[f.key] ?? ''}
                    onChange={(e) =>
                      handleTextFilterChange(
                        f.key,
                        e.target.value,
                        f.debounceMs ?? (f.searchIcon ? DEFAULT_SEARCH_DEBOUNCE_MS : undefined)
                      )
                    }
                    placeholder={f.placeholder}
                    className={`glass-input w-full py-2 text-sm pr-9 ${f.searchIcon ? 'pl-9' : 'pl-3'}`}
                    aria-label={f.label}
                  />
                  {((localTextValues[f.key] ?? filterValues[f.key] ?? '') as string).trim() !== '' && (
                    <button
                      type="button"
                      onClick={() => handleTextFilterChange(f.key, '', f.debounceMs)}
                      className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
                      title={t.clearFilters ?? 'Limpiar'}
                      aria-label={t.clearFilters ?? 'Limpiar'}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {activeFilters && (
            <GlassButton
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5"
            >
              <FilterX size={16} />
              {t.clearFilters ?? 'Limpiar filtros'}
            </GlassButton>
          )}
        </div>
        {exportFormats.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">
              {t.export ?? 'Exportar'}
            </span>
            {exportFormats.includes('pdf') && (
              <button
                type="button"
                onClick={() => openExportModal('pdf')}
                className="glass-button inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm bg-rose-500 text-white hover:bg-rose-600"
                title={t.exportPdf ?? 'PDF'}
              >
                <FileText size={16} />
              </button>
            )}
            {exportFormats.includes('csv') && (
              <button
                type="button"
                onClick={() => openExportModal('csv')}
                className="glass-button inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm bg-black text-white hover:bg-neutral-800"
                title={t.exportCsv ?? 'CSV'}
              >
                <FileDown size={16} />
              </button>
            )}
            {exportFormats.includes('xlsx') && (
              <button
                type="button"
                onClick={() => openExportModal('xlsx')}
                className="glass-button inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm bg-emerald-500 text-white hover:bg-emerald-600"
                title={t.exportExcel ?? 'Excel'}
              >
                <FileSpreadsheet size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabla */}
      {loading && data.length === 0 ? (
        <p className="py-8 text-center text-[var(--text-secondary)]">
          Cargando…
        </p>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-[var(--text-secondary)]">
          {emptyMessage}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="px-4 py-3 font-medium text-[var(--text-primary)]"
                      style={col.width ? { width: col.width } : undefined}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && onSort && (
                          <button
                            type="button"
                            onClick={() => {
                              const next =
                                sortState?.columnId === col.id &&
                                sortState?.order === 'asc'
                                  ? 'desc'
                                  : 'asc'
                              onSort(col.id, next)
                            }}
                            className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                            aria-label={`Ordenar por ${col.label}`}
                          >
                            {sortState?.columnId === col.id ? (
                              sortState.order === 'asc' ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )
                            ) : (
                              <ChevronUp size={16} className="opacity-40" />
                            )}
                          </button>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="w-24 px-4 py-3 font-medium text-[var(--text-primary)]">
                    {t.actions ?? ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr
                    key={getRowId(row)}
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (
                        target.closest('button') ||
                        target.closest('a') ||
                        target.closest('input') ||
                        target.closest('select') ||
                        target.closest('[role="switch"]')
                      ) {
                        return
                      }
                      onRowClick?.(row, e)
                    }}
                    className={`${rowClassName?.(row) ?? getTableRowClass(rowVariant?.(row) ?? 'default')} ${
                      onRowClick ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className="px-4 py-3 first:font-medium first:text-[var(--text-primary)]"
                      >
                        {renderCell(col, row)}
                      </td>
                    ))}
                    <td className="px-4 py-3">{renderActions(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(pagination.totalPages > 1 || onLimitChange) && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
              <div className="flex flex-wrap items-center gap-4">
                {onLimitChange && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[var(--text-muted)]" htmlFor="dt-page-size">
                      {t.rowsPerPage ?? 'Por página'}
                    </label>
                    <select
                      id="dt-page-size"
                      value={pagination.limit}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        if (PAGE_SIZE_OPTIONS.includes(val as 5 | 10 | 15 | 20)) onLimitChange(val)
                      }}
                      className="glass-input w-16 px-2 py-1.5 text-sm"
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                )}
                {pagination.totalPages > 1 && (
                  <p className="text-sm text-[var(--text-muted)]">
                    {t.page ?? 'Página'} {pagination.page} {t.of ?? 'de'}{' '}
                    {pagination.totalPages}
                  </p>
                )}
              </div>
              {pagination.totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                  className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                  {t.previous ?? 'Anterior'}
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => onPageChange(pagination.page + 1)}
                  className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {t.next ?? 'Siguiente'}
                  <ChevronRight size={18} />
                </button>
              </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
