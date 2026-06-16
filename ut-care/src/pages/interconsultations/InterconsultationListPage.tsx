import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, MessageSquare } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { getInterconsultations } from '@/services/interconsultation.service'
import type { Interconsultation } from '@/types/interconsultation'
import { STATUS_VALUES, URGENCY_VALUES, DEPARTMENT_VALUES } from '@/types/interconsultation'
import { getStatusBadgeClass } from '@/utils/tableRowColors'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

function patientName(i: Interconsultation): string {
  if (!i.patient?.user) return '—'
  return `${i.patient.user.firstName} ${i.patient.user.lastName}`.trim()
}

const STATUS_KEY: Record<string, string> = {
  Pendiente: 'statusPending',
  Respondida: 'statusResponded',
  Cancelada: 'statusCancelled',
}
const URGENCY_KEY: Record<string, string> = {
  Baja: 'urgencyLow',
  Media: 'urgencyMedium',
  Alta: 'urgencyHigh',
  Urgente: 'urgencyUrgent',
}

export function InterconsultationListPage() {
  const { t } = useTranslation()
  const [interconsultations, setInterconsultations] = useState<Interconsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [urgency, setUrgency] = useState('')
  const [fromDepartment, setFromDepartment] = useState('')
  const [toDepartment, setToDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(() => getDefaultTableLimit())
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: null,
    order: 'asc',
  })

  useEffect(() => {
    setLoading(true)
    setError(null)
    getInterconsultations({
      page,
      limit,
      status: status || undefined,
      urgency: urgency || undefined,
      fromDepartment: fromDepartment || undefined,
      toDepartment: toDepartment || undefined,
    })
      .then((r) => {
        setInterconsultations(r.interconsultations)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, limit, status, urgency, fromDepartment, toDepartment, t])

  const normalizeStatus = (value: string) => {
    const v = value?.toString().trim().toLowerCase()
    // Soporta valores en español (DB/enum), en inglés (seed anterior) y estilos tipo snake_case.
    if (!v) return ''
    if (v === 'cancelada' || v === 'cancelled' || v.startsWith('cancel')) return 'Cancelada'
    if (
      v === 'respondida' ||
      v === 'responded' ||
      v.startsWith('respond') ||
      v === 'completed' ||
      v === 'complete' ||
      v === 'done' ||
      v.startsWith('complete')
    )
      return 'Respondida'
    if (v === 'pendiente' || v === 'pending' || v.startsWith('pend') || v === 'in_progress' || v.includes('inprogress'))
      return 'Pendiente'
    return value
  }

  const getStatusTranslationKey = (value: string) => {
    const normalized = normalizeStatus(value)
    return STATUS_KEY[normalized] ?? undefined
  }

  const getStatusVariant = (value: string): 'success' | 'warning' | 'error' => {
    const normalized = normalizeStatus(value)
    if (normalized === 'Respondida') return 'success'
    if (normalized === 'Cancelada') return 'error'
    return 'warning'
  }

  const columns: DataTableColumn<Interconsultation>[] = [
    { id: 'patient', label: t('interconsultations.patient'), getValue: (row) => patientName(row), sortable: true },
    { id: 'fromDepartment', label: t('interconsultations.fromDepartment'), getValue: (row) => row.fromDepartment, sortable: true },
    { id: 'toDepartment', label: t('interconsultations.toDepartment'), getValue: (row) => row.toDepartment, sortable: true },
    {
      id: 'urgency',
      label: t('interconsultations.urgency'),
      getValue: (row) => t(`interconsultations.${URGENCY_KEY[row.urgency] || row.urgency}`),
      sortable: true,
    },
    {
      id: 'status',
      label: t('interconsultations.status'),
      getValue: (row) => {
        const key = getStatusTranslationKey(row.status)
        return key ? t(`interconsultations.${key}`) : row.status
      },
      render: (row) => {
        const variant = getStatusVariant(row.status)
        const badgeClass = getStatusBadgeClass(variant)
        const label = (() => {
          const key = getStatusTranslationKey(row.status)
          return key ? t(`interconsultations.${key}`) : row.status
        })()
        return <span className={badgeClass}>{label || '—'}</span>
      },
      sortable: true,
    },
    { id: 'createdAt', label: 'Fecha', getValue: (row) => formatDate(row.createdAt), sortable: true },
  ]

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return interconsultations
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return interconsultations
    return [...interconsultations].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [interconsultations, sortState, columns])

  const filterValues = { status, urgency, fromDepartment, toDepartment }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'status') setStatus(value)
    else if (key === 'urgency') setUrgency(value)
    else if (key === 'fromDepartment') setFromDepartment(value)
    else if (key === 'toDepartment') setToDepartment(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setStatus('')
    setUrgency('')
    setFromDepartment('')
    setToDepartment('')
    setPage(1)
  }

  const rowVariant = (row: Interconsultation): 'success' | 'warning' | 'error' | 'default' => {
    return getStatusVariant(row.status)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <MessageSquare className="text-[var(--color-primary)]" size={28} />
            {t('interconsultations.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('interconsultations.description')}
          </p>
        </div>
        <div>
          <Link to="/interconsultations/new" className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition-transform hover:scale-[1.02]">
            <Plus size={18} />
            {t('interconsultations.newInterconsultation')}
          </Link>
        </div>
      </div>
      <GlassCard>
        <DataTable
          columns={columns}
          data={sortedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage={t('interconsultations.noInterconsultations')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            { key: 'status', label: t('interconsultations.status'), type: 'select', options: STATUS_VALUES.map((v) => ({ value: v, label: t(`interconsultations.${STATUS_KEY[v] || v}`) })) },
            { key: 'urgency', label: t('interconsultations.urgency'), type: 'select', options: URGENCY_VALUES.map((v) => ({ value: v, label: t(`interconsultations.${URGENCY_KEY[v] || v}`) })) },
            { key: 'fromDepartment', label: t('interconsultations.fromDepartment'), type: 'select', options: DEPARTMENT_VALUES.map((v) => ({ value: v, label: v })) },
            { key: 'toDepartment', label: t('interconsultations.toDepartment'), type: 'select', options: DEPARTMENT_VALUES.map((v) => ({ value: v, label: v })) },
          ]}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={(row) => (
            <Link to={`/interconsultations/${row.id}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline">
              <MessageSquare size={16} />
              {t('interconsultations.viewDetail')}
            </Link>
          )}
          rowVariant={rowVariant}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="interconsultas"
          exportTitle={t('interconsultations.title')}
          i18n={{
            clearFilters: t('table.clearFilters'),
            export: t('table.export'),
            exportPdf: t('table.exportPdf'),
            exportCsv: t('table.exportCsv'),
            exportExcel: t('table.exportExcel'),
            previous: t('table.previous'),
            next: t('table.next'),
            page: t('table.page'),
            of: t('table.of'),
            all: t('table.all'),
            rowsPerPage: t('table.rowsPerPage'),
          }}
        />
      </GlassCard>
    </div>
  )
}
