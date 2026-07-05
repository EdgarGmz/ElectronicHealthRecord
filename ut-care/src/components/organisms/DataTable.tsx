import { type ReactNode, useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
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
import { useTranslation } from 'react-i18next'

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
  /** Formatos de exportación mostrados. Si se omite, no se muestra la opción de exportar. */
  exportFormats?: ('pdf' | 'csv' | 'xlsx')[]
  exportFilename?: string
  exportTitle?: string
  /** Función para recuperar el conjunto de datos completo (sin paginar) según los filtros activos. */
  fetchFullData?: (filterValues: Record<string, string>) => Promise<T[]>
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

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
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
  fetchFullData,
  i18n = {},
}: DataTableProps<T>) {
  void _error
  const currentUser = useAuthStore((s) => s.user)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportStep, setExportStep] = useState(1)
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'xlsx'>('pdf')
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current')
  const [filenameInput, setFilenameInput] = useState('')
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [exportPassword, setExportPassword] = useState('')
  const [exportPasswordError, setExportPasswordError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

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

  const { t: tI18n } = useTranslation()
  const t = {
    actions: i18n.actions || tI18n('table.actions'),
    clearFilters: i18n.clearFilters || tI18n('table.clearFilters'),
    export: i18n.export || tI18n('table.export'),
    exportPdf: i18n.exportPdf || tI18n('table.exportPdf'),
    exportCsv: i18n.exportCsv || tI18n('table.exportCsv'),
    exportExcel: i18n.exportExcel || tI18n('table.exportExcel'),
    previous: i18n.previous || tI18n('table.previous'),
    next: i18n.next || tI18n('table.next'),
    page: i18n.page || tI18n('table.page'),
    of: i18n.of || tI18n('table.of'),
    all: i18n.all || tI18n('table.all'),
    rowsPerPage: i18n.rowsPerPage || tI18n('table.rowsPerPage'),
    exportWizard: {
      title: tI18n('table.exportWizard.title'),
      stepFormat: tI18n('table.exportWizard.stepFormat'),
      stepSecurity: tI18n('table.exportWizard.stepSecurity'),
      stepSave: tI18n('table.exportWizard.stepSave'),
      stepConfirm: tI18n('table.exportWizard.stepConfirm'),
      selectFormatAndScope: tI18n('table.exportWizard.selectFormatAndScope'),
      formatTitle: tI18n('table.exportWizard.formatTitle'),
      scopeTitle: tI18n('table.exportWizard.scopeTitle'),
      scopeCurrent: tI18n('table.exportWizard.scopeCurrent'),
      scopeCurrentDesc: (count: number) => tI18n('table.exportWizard.scopeCurrentDesc', { count }),
      scopeAll: tI18n('table.exportWizard.scopeAll'),
      scopeAllDesc: (count: number) => tI18n('table.exportWizard.scopeAllDesc', { count }),
      scopeAllNotAvailable: tI18n('table.exportWizard.scopeAllNotAvailable'),
      securityTitle: tI18n('table.exportWizard.securityTitle'),
      securityWarningHeader: tI18n('table.exportWizard.securityWarningHeader'),
      securityWarningText: tI18n('table.exportWizard.securityWarningText'),
      securityAcceptCheckbox: tI18n('table.exportWizard.securityAcceptCheckbox'),
      filenameLabel: tI18n('table.exportWizard.filenameLabel'),
      saveNoteTitle: tI18n('table.exportWizard.saveNoteTitle'),
      saveNoteText: tI18n('table.exportWizard.saveNoteText'),
      confirmPasswordText: tI18n('table.exportWizard.confirmPasswordText'),
      passwordLabel: tI18n('table.exportWizard.passwordLabel'),
      btnBack: tI18n('table.exportWizard.btnBack'),
      btnCancel: tI18n('table.exportWizard.btnCancel'),
      btnNext: tI18n('table.exportWizard.btnNext'),
      btnExporting: tI18n('table.exportWizard.btnExporting'),
      btnExport: tI18n('table.exportWizard.btnExport'),
      exportButtonText: tI18n('table.exportWizard.exportButtonText'),
      reportDefaultTitle: tI18n('table.exportWizard.reportDefaultTitle'),
      confidentialHeader: tI18n('table.exportWizard.confidentialHeader'),
      generatedBy: tI18n('table.exportWizard.generatedBy'),
      roleLabel: tI18n('table.exportWizard.roleLabel'),
      dateTimeLabel: tI18n('table.exportWizard.dateTimeLabel'),
      securityDisclaimerLabel: tI18n('table.exportWizard.securityDisclaimerLabel'),
    }
  }

  const activeFilters = hasActiveFilters(filterValues)

  const handleExport = (format: 'pdf' | 'csv' | 'xlsx', exportData: T[], finalFilename: string) => {
    const headers = columns.map((c) => c.label)
    const rows = exportData.map((row) =>
      columns.map((col) => String(col.getValue(row) ?? ''))
    )

    const meta = currentUser ? {
      user: `${currentUser.firstName} ${currentUser.lastName} (${currentUser.username})`,
      role: tI18n(`roles.${currentUser.role}`) || currentUser.role || 'Usuario',
      dateTime: new Date().toLocaleString(tI18n('language.es') === 'Español' ? 'es-MX' : 'en-US', { dateStyle: 'long', timeStyle: 'medium' }),
      disclaimer: t.exportWizard.securityWarningText,
    } : undefined

    if (format === 'csv') exportTableToCsv(headers, rows, finalFilename, meta)
    else if (format === 'xlsx') exportTableToXlsx(headers, rows, finalFilename, exportTitle || t.exportWizard.reportDefaultTitle, meta)
    else exportTableToPdf(headers, rows, finalFilename, exportTitle || t.exportWizard.reportDefaultTitle, meta)
  }

  const openExportWizard = () => {
    if (!data.length) return
    setSelectedFormat('pdf')
    setExportScope('current')
    setFilenameInput(exportFilename)
    setDisclaimerAccepted(false)
    setExportPassword('')
    setExportPasswordError(null)
    setExportStep(1)
    setExportModalOpen(true)
  }

  const handleConfirmExport = async () => {
    if (!currentUser?.username) {
      setExportPasswordError('No hay usuario en sesión')
      return
    }
    if (!exportPassword) {
      setExportPasswordError('La contraseña es requerida')
      return
    }
    setExportLoading(true)
    setExportPasswordError(null)
    try {
      // Validar credenciales antes de exportar
      await api.post('/auth/login', {
        username: currentUser.username,
        password: exportPassword,
      })

      // Obtener datos según alcance seleccionado
      let exportData = data
      if (exportScope === 'all' && fetchFullData) {
        exportData = await fetchFullData(filterValues)
      }

      handleExport(selectedFormat, exportData, filenameInput || exportFilename)
      setExportModalOpen(false)
      setExportPassword('')
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setExportPasswordError(msg || 'Credenciales inválidas')
    } finally {
      setExportLoading(false)
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
      {exportModalOpen && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 border border-white/20 bg-white/5 dark:bg-black/20 shadow-2xl backdrop-blur-xl animate-fade-in text-[var(--text-primary)]">
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileDown className="text-[var(--color-primary)]" size={20} />
                <span>{t.exportWizard.title}</span>
              </h2>
              <button
                type="button"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => !exportLoading && setExportModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Progreso del Wizard */}
            <div className="flex items-center justify-between mb-6 text-xs text-[var(--text-muted)] font-medium px-1">
              <span className={exportStep === 1 ? 'text-[var(--color-primary)] font-bold' : ''}>{t.exportWizard.stepFormat}</span>
              <span className="opacity-40">→</span>
              <span className={exportStep === 2 ? 'text-[var(--color-primary)] font-bold' : ''}>{t.exportWizard.stepSecurity}</span>
              <span className="opacity-40">→</span>
              <span className={exportStep === 3 ? 'text-[var(--color-primary)] font-bold' : ''}>{t.exportWizard.stepSave}</span>
              <span className="opacity-40">→</span>
              <span className={exportStep === 4 ? 'text-[var(--color-primary)] font-bold' : ''}>{t.exportWizard.stepConfirm}</span>
            </div>

            {/* Contenido según el paso */}
            <div className="min-h-[180px] mb-6">
              {exportStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">{t.exportWizard.selectFormatAndScope}</p>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{t.exportWizard.formatTitle}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {exportFormats.includes('pdf') && (
                        <button
                          type="button"
                          onClick={() => setSelectedFormat('pdf')}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                            selectedFormat === 'pdf'
                              ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'border-white/10 hover:bg-white/5'
                          }`}
                        >
                          <FileText size={24} />
                          <span>PDF</span>
                        </button>
                      )}
                      {exportFormats.includes('csv') && (
                        <button
                          type="button"
                          onClick={() => setSelectedFormat('csv')}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                            selectedFormat === 'csv'
                              ? 'border-neutral-700 bg-neutral-700/10 text-neutral-800 dark:text-neutral-200'
                              : 'border-white/10 hover:bg-white/5'
                          }`}
                        >
                          <FileDown size={24} />
                          <span>CSV</span>
                        </button>
                      )}
                      {exportFormats.includes('xlsx') && (
                        <button
                          type="button"
                          onClick={() => setSelectedFormat('xlsx')}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                            selectedFormat === 'xlsx'
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-white/10 hover:bg-white/5'
                          }`}
                        >
                          <FileSpreadsheet size={24} />
                          <span>Excel</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{t.exportWizard.scopeTitle}</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer text-sm font-medium">
                        <input
                          type="radio"
                          name="exportScope"
                          checked={exportScope === 'current'}
                          onChange={() => setExportScope('current')}
                          className="accent-[var(--color-primary)]"
                        />
                        <div className="ml-2">
                          <p>{t.exportWizard.scopeCurrent}</p>
                          <p className="text-xs text-[var(--text-muted)]">{t.exportWizard.scopeCurrentDesc(data.length)}</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 p-3 rounded-xl border border-white/10 cursor-pointer text-sm font-medium ${
                        !fetchFullData ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'
                      }`}>
                        <input
                          type="radio"
                          name="exportScope"
                          checked={exportScope === 'all'}
                          disabled={!fetchFullData}
                          onChange={() => setExportScope('all')}
                          className="accent-[var(--color-primary)]"
                        />
                        <div className="ml-2">
                          <p>{t.exportWizard.scopeAll}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {fetchFullData
                              ? t.exportWizard.scopeAllDesc(pagination.total)
                              : t.exportWizard.scopeAllNotAvailable}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {exportStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-300">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 text-rose-600 dark:text-rose-400">
                      {t.exportWizard.securityWarningHeader}
                    </p>
                    <p className="text-xs leading-relaxed text-justify">
                      {t.exportWizard.securityWarningText}
                    </p>
                  </div>

                  <label className="flex items-start gap-3 p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disclaimerAccepted}
                      onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                      className="mt-1 accent-rose-500"
                    />
                    <span className="text-xs text-[var(--text-secondary)] leading-normal">
                      {t.exportWizard.securityAcceptCheckbox}
                    </span>
                  </label>
                </div>
              )}

              {exportStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      {t.exportWizard.filenameLabel}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={filenameInput}
                        onChange={(e) => setFilenameInput(e.target.value)}
                        className="glass-input w-full px-4 py-2.5 text-sm pr-12"
                        placeholder="reporte_datos"
                      />
                      <span className="absolute right-4 text-xs font-medium text-[var(--text-muted)]">
                        .{selectedFormat}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-xs text-[var(--text-muted)] leading-relaxed space-y-1">
                    <p className="font-semibold text-[var(--text-secondary)]">{t.exportWizard.saveNoteTitle}</p>
                    <p>{t.exportWizard.saveNoteText}</p>
                  </div>
                </div>
              )}

              {exportStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t.exportWizard.confirmPasswordText}
                  </p>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--text-primary)]">
                      {t.exportWizard.passwordLabel}
                    </label>
                    <PasswordInput
                      value={exportPassword}
                      onChange={(e) => {
                        setExportPassword(e.target.value)
                        setExportPasswordError(null)
                      }}
                      placeholder="********"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !exportLoading) {
                          e.preventDefault()
                          handleConfirmExport()
                        }
                      }}
                    />
                    {exportPasswordError && (
                      <p className="text-xs text-[var(--color-error)]">{exportPasswordError}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal con botones de navegación del Wizard */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {exportStep > 1 ? (
                <GlassButton
                  type="button"
                  onClick={() => setExportStep((s) => s - 1)}
                  disabled={exportLoading}
                >
                  {t.exportWizard.btnBack}
                </GlassButton>
              ) : (
                <GlassButton
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                >
                  {t.exportWizard.btnCancel}
                </GlassButton>
              )}

              {exportStep < 4 ? (
                <GlassButton
                  type="button"
                  variant="primary"
                  disabled={exportStep === 2 && !disclaimerAccepted}
                  onClick={() => setExportStep((s) => s + 1)}
                >
                  {t.exportWizard.btnNext}
                </GlassButton>
              ) : (
                <GlassButton
                  type="button"
                  variant="primary"
                  disabled={exportLoading}
                  onClick={handleConfirmExport}
                >
                  {exportLoading ? t.exportWizard.btnExporting : t.exportWizard.btnExport}
                </GlassButton>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
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
                  className="glass-input w-full min-w-[140px] px-4 py-2.5 text-sm sm:w-auto h-[46px]"
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
                  className="glass-input w-full min-w-[140px] px-4 py-2.5 text-sm sm:w-auto h-[46px]"
                />
              ) : (
                <div className="relative flex min-w-[200px] items-center sm:w-auto">
                  {f.searchIcon && (
                    <Search
                      size={16}
                      className="absolute left-3.5 pointer-events-none text-[var(--text-muted)]"
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
                    className={`glass-input w-full py-2.5 text-sm pr-10 h-[46px] ${f.searchIcon ? 'pl-10' : 'pl-4'}`}
                    aria-label={f.label}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {((localTextValues[f.key] ?? filterValues[f.key] ?? '') as string).trim() !== '' && (
                    <button
                      type="button"
                      onClick={() => handleTextFilterChange(f.key, '', f.debounceMs)}
                      className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
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
              className="inline-flex items-center gap-1.5 h-[46px]"
            >
              <FilterX size={16} />
              {t.clearFilters ?? 'Limpiar filtros'}
            </GlassButton>
          )}
        </div>
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
          {(pagination.totalPages > 1 || onLimitChange || exportFormats.length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 w-full">
              {/* Sección Izquierda: Selector por página e indicador de página */}
              <div className="flex items-center gap-4 min-w-[200px] flex-1 justify-start">
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
                        if (PAGE_SIZE_OPTIONS.includes(val as 10 | 20 | 50 | 100)) onLimitChange(val)
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

              {/* Sección Central: Anterior y Siguiente */}
              <div className="flex items-center justify-center min-w-[220px] flex-1">
                {pagination.totalPages > 1 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => onPageChange(pagination.page - 1)}
                      className="glass-button inline-flex items-center gap-1 disabled:opacity-50 h-[38px] px-3 text-sm"
                    >
                      <ChevronLeft size={16} />
                      {t.previous ?? 'Anterior'}
                    </button>
                    <button
                      type="button"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => onPageChange(pagination.page + 1)}
                      className="glass-button inline-flex items-center gap-1 disabled:opacity-50 h-[38px] px-3 text-sm"
                    >
                      {t.next ?? 'Siguiente'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Sección Derecha: Botón Exportar */}
              <div className="flex items-center justify-end min-w-[150px] flex-1">
                {exportFormats.length > 0 && (
                  <GlassButton
                    type="button"
                    variant="primary"
                    onClick={openExportWizard}
                    className="inline-flex items-center gap-2 hover:scale-[1.02] transition-all duration-200 h-[38px] px-4 text-sm"
                  >
                    <FileDown size={18} />
                    {t.exportWizard.exportButtonText || 'Exportar datos'}
                  </GlassButton>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
