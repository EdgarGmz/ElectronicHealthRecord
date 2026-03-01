import type { ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FilterX,
  FileText,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react'
import { GlassButton } from '@/components/atoms/GlassButton'
import { getTableRowClass, getStatusBadgeClass } from '@/utils/tableRowColors'
import type { TableRowVariant } from '@/utils/tableRowColors'
import {
  exportTableToCsv,
  exportTableToXlsx,
  exportTableToPdf,
} from '@/utils/tableExport'

export interface DataTableFilterConfig {
  key: string
  label: string
  type: 'select' | 'text' | 'date'
  options?: { value: string; label: string }[]
  placeholder?: string
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
  /** Formatos de exportación mostrados. */
  exportFormats?: ('pdf' | 'csv' | 'xlsx')[]
  exportFilename?: string
  exportTitle?: string
  /** Claves i18n para la barra de herramientas. */
  i18n?: {
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
  }
}

function hasActiveFilters(filterValues: Record<string, string>): boolean {
  return Object.values(filterValues).some((v) => v !== '' && v != null)
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  loading,
  error,
  emptyMessage,
  pagination,
  onPageChange,
  filters = [],
  filterValues,
  onFilterChange,
  onClearFilters,
  onSort,
  sortState,
  renderActions,
  rowVariant,
  rowClassName,
  exportFormats = ['pdf', 'csv', 'xlsx'],
  exportFilename = 'datos',
  exportTitle,
  i18n = {},
}: DataTableProps<T>) {
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

  if (loading) return null
  if (error) return null

  return (
    <div className="space-y-4">
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
                <input
                  type="text"
                  value={filterValues[f.key] ?? ''}
                  onChange={(e) => onFilterChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="glass-input w-full min-w-[160px] px-3 py-2 text-sm sm:w-auto"
                />
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
                onClick={() => handleExport('pdf')}
                className="glass-button inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm"
                title={t.exportPdf ?? 'PDF'}
              >
                <FileText size={16} />
              </button>
            )}
            {exportFormats.includes('csv') && (
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="glass-button inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm"
                title={t.exportCsv ?? 'CSV'}
              >
                <FileDown size={16} />
              </button>
            )}
            {exportFormats.includes('xlsx') && (
              <button
                type="button"
                onClick={() => handleExport('xlsx')}
                className="glass-button inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm"
                title={t.exportExcel ?? 'Excel'}
              >
                <FileSpreadsheet size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabla */}
      {data.length === 0 ? (
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
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr
                    key={getRowId(row)}
                    className={rowClassName?.(row) ?? getTableRowClass(rowVariant?.(row) ?? 'default')}
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
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
              <p className="text-sm text-[var(--text-muted)]">
                {t.page ?? 'Página'} {pagination.page} {t.of ?? 'de'}{' '}
                {pagination.totalPages}
              </p>
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
            </div>
          )}
        </>
      )}
    </div>
  )
}
