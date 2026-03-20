import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { getAuditLogs } from '@/services/audit-log.service'
import type { AuditLog, AuditLogsResponse } from '@/types/audit-log'
import { ROLES } from '@/constants/roles'

const ACTION_VALUES = ['LOGIN', 'LOGOUT', 'CREATE', 'READ', 'VIEW_RECORD', 'UPDATE', 'DELETE'] as const

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

function getActionRowClass(action: string): string {
  const a = action.toUpperCase()
  if (a === 'LOGIN') return 'border-b border-[var(--border)] last:border-0 bg-[#3b82f6]/12 dark:bg-[#3b82f6]/20 border-l-4 border-l-[#3b82f6]'
  if (a === 'LOGOUT') return 'border-b border-[var(--border)] last:border-0 bg-[#6b7280]/10 dark:bg-[#6b7280]/15 border-l-4 border-l-[#6b7280]'
  if (a === 'CREATE') return 'border-b border-[var(--border)] last:border-0 bg-[#22c55e]/12 dark:bg-[#22c55e]/20 border-l-4 border-l-[#22c55e]'
  if (a === 'READ' || a === 'VIEW_RECORD') return 'border-b border-[var(--border)] last:border-0 bg-[#8b5cf6]/12 dark:bg-[#8b5cf6]/20 border-l-4 border-l-[#8b5cf6]'
  if (a === 'UPDATE') return 'border-b border-[var(--border)] last:border-0 bg-[#f59e0b]/12 dark:bg-[#f59e0b]/20 border-l-4 border-l-[#f59e0b]'
  if (a === 'DELETE') return 'border-b border-[var(--border)] last:border-0 bg-[#ef4444]/12 dark:bg-[#ef4444]/20 border-l-4 border-l-[#ef4444]'
  return 'border-b border-[var(--border)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5 border-l-4 border-l-[var(--border)]'
}

function getActionLabel(action: string, t: (key: string) => string): string {
  const a = action.toUpperCase()
  if (a === 'LOGIN') return t('auditLogs.actionLogin')
  if (a === 'LOGOUT') return t('auditLogs.actionLogout')
  if (a === 'CREATE') return t('auditLogs.actionCreate')
  if (a === 'READ' || a === 'VIEW_RECORD') return t('auditLogs.actionRead')
  if (a === 'UPDATE') return t('auditLogs.actionUpdate')
  if (a === 'DELETE') return t('auditLogs.actionDelete')
  return action
}

export function AuditLogsPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<AuditLogsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [limit, setLimit] = useState(() => getDefaultTableLimit())

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAuditLogs({
      page,
      limit,
      action: actionFilter || undefined,
      role: roleFilter || undefined,
      startDate: dateFrom ? `${dateFrom}T00:00:00.000Z` : undefined,
      endDate: dateTo ? `${dateTo}T23:59:59.999Z` : undefined,
    })
      .then(setData)
      .catch(() => {
        setError(t('auditLogs.error'))
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [page, roleFilter, actionFilter, dateFrom, dateTo, t])

  const userDisplay = (log: AuditLog) =>
    `${log.user.firstName} ${log.user.lastName}`.trim() || log.user.email

  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: null,
    order: 'asc',
  })

  const columns: DataTableColumn<AuditLog>[] = [
    { id: 'createdAt', label: t('auditLogs.tableDate'), getValue: (row) => formatDateTime(row.createdAt), sortable: true },
    { id: 'user', label: t('auditLogs.tableUser'), getValue: (row) => userDisplay(row), sortable: true },
    { id: 'role', label: t('auditLogs.tableRole'), getValue: (row) => t(`roles.${row.user.role}`) || row.user.role, sortable: true },
    { id: 'action', label: t('auditLogs.tableAction'), getValue: (row) => getActionLabel(row.action, t), sortable: true },
    { id: 'tableName', label: t('auditLogs.tableResource'), getValue: (row) => row.tableName },
    { id: 'recordId', label: t('auditLogs.tableRecordId'), getValue: (row) => row.recordId },
    { id: 'ipAddress', label: t('auditLogs.tableIp'), getValue: (row) => row.ipAddress ?? '—' },
  ]

  const sortedData = useMemo(() => {
    const logs = data?.auditLogs ?? []
    if (!sortState.columnId) return logs
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return logs
    return [...logs].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [data?.auditLogs, sortState, columns])

  const filterValues = { role: roleFilter, action: actionFilter, dateFrom, dateTo }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'role') setRoleFilter(value)
    else if (key === 'action') setActionFilter(value)
    else if (key === 'dateFrom') setDateFrom(value)
    else if (key === 'dateTo') setDateTo(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setRoleFilter('')
    setActionFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const pagination = data?.pagination ?? { page: 1, limit, total: 0, totalPages: 0 }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <p className="text-sm text-[var(--text-muted)]">{t('auditLogs.subtitle')}</p>

      <GlassCard>
        <DataTable
          columns={columns}
          data={sortedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage={t('auditLogs.noData')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            { key: 'role', label: t('auditLogs.filterRole'), type: 'select', options: [ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.PSICOLOGO, ROLES.ENFERMERO].map((v) => ({ value: v, label: t(`roles.${v}`) })) },
            { key: 'action', label: t('auditLogs.filterAction'), type: 'select', options: ACTION_VALUES.map((ac) => ({ value: ac, label: getActionLabel(ac, t) })) },
            { key: 'dateFrom', label: t('auditLogs.filterDateFrom'), type: 'date' },
            { key: 'dateTo', label: t('auditLogs.filterDateTo'), type: 'date' },
          ]}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={() => null}
          rowClassName={(row) => getActionRowClass(row.action)}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="bitacora"
          exportTitle={t('auditLogs.title')}
          i18n={{
            clearFilters: t('table.clearFilters'),
            export: t('table.export'),
            exportPdf: t('table.exportPdf'),
            exportCsv: t('table.exportCsv'),
            exportExcel: t('table.exportExcel'),
            previous: t('auditLogs.prevPage'),
            next: t('auditLogs.nextPage'),
            page: t('auditLogs.page'),
            of: '/',
            all: t('reports.departmentAll'),
            rowsPerPage: t('table.rowsPerPage'),
          }}
        />
      </GlassCard>
    </div>
  )
}
