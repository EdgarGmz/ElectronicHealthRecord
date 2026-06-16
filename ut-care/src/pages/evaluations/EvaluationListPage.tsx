import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, ClipboardList } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { getPsychometricEvaluations } from '@/services/psychometric-evaluation.service'
import type { PsychometricEvaluation } from '@/types/psychometric-evaluation'

/** Tipos de evaluación (coinciden con el seed/API). */
const EVALUATION_TYPES = [
  'Beck Depression Inventory',
  'Hamilton Anxiety Scale',
  'MMPI-2',
  'Rorschach',
  'WAIS-IV',
  'SCL-90-R',
] as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

function patientName(e: PsychometricEvaluation): string {
  const patient = e.psychologyRecord?.medicalRecord?.patient
  if (!patient?.user) return '—'
  return `${patient.user.firstName} ${patient.user.lastName}`.trim()
}

function administeredByName(e: PsychometricEvaluation): string {
  if (!e.administeredByUser) return '—'
  return `${e.administeredByUser.firstName} ${e.administeredByUser.lastName}`.trim()
}

export function EvaluationListPage() {
  const { t } = useTranslation()
  const [evaluations, setEvaluations] = useState<PsychometricEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [evaluationType, setEvaluationType] = useState('')
  const [applicationDateFrom, setApplicationDateFrom] = useState('')
  const [applicationDateTo, setApplicationDateTo] = useState('')
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
    getPsychometricEvaluations({
      page,
      limit,
      evaluationType: evaluationType || undefined,
      applicationDateFrom: applicationDateFrom || undefined,
      applicationDateTo: applicationDateTo || undefined,
    })
      .then((r) => {
        setEvaluations(r.evaluations)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, limit, evaluationType, applicationDateFrom, applicationDateTo, t])

  const columns: DataTableColumn<PsychometricEvaluation>[] = [
    { id: 'evaluationType', label: t('evaluations.evaluationType'), getValue: (row) => row.evaluationType, sortable: true },
    { id: 'patient', label: t('evaluations.patient'), getValue: (row) => patientName(row), sortable: true },
    { id: 'applicationDate', label: t('evaluations.applicationDate'), getValue: (row) => formatDate(row.applicationDate), sortable: true },
    { id: 'administeredBy', label: t('evaluations.administeredBy'), getValue: (row) => administeredByName(row), sortable: true },
  ]

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return evaluations
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return evaluations
    return [...evaluations].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [evaluations, sortState, columns])

  const filterValues = { evaluationType: evaluationType, applicationDateFrom, applicationDateTo }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'evaluationType') setEvaluationType(value)
    else if (key === 'applicationDateFrom') setApplicationDateFrom(value)
    else if (key === 'applicationDateTo') setApplicationDateTo(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setEvaluationType('')
    setApplicationDateFrom('')
    setApplicationDateTo('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ClipboardList className="text-[var(--color-primary)]" size={28} />
            {t('evaluations.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('evaluations.description')}
          </p>
        </div>
        <div>
          <Link to="/evaluations/new" className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium">
            <Plus size={18} />
            {t('evaluations.newEvaluation')}
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
          emptyMessage={t('evaluations.noEvaluations')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            {
              key: 'evaluationType',
              label: t('evaluations.evaluationType'),
              type: 'select',
              options: EVALUATION_TYPES.map((value) => ({ value, label: value })),
            },
            { key: 'applicationDateFrom', label: t('reports.periodStart'), type: 'date' },
            { key: 'applicationDateTo', label: t('reports.periodEnd'), type: 'date' },
          ]}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={(row) => (
            <Link to={`/evaluations/${row.id}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline">
              <ClipboardList size={16} />
              {t('evaluations.viewDetail')}
            </Link>
          )}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="evaluaciones"
          exportTitle={t('evaluations.title')}
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
