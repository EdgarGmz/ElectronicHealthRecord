import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Stethoscope } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { getNursingProcedures } from '@/services/nursing-procedure.service'
import type { NursingProcedure } from '@/types/nursing-procedure'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

function patientName(p: NursingProcedure): string {
  const patient = p.consultation?.medicalRecord?.patient
  if (!patient?.user) return '—'
  return `${patient.user.firstName} ${patient.user.lastName}`.trim()
}

function performedByName(p: NursingProcedure): string {
  if (!p.performedByUser) return '—'
  return `${p.performedByUser.firstName} ${p.performedByUser.lastName}`.trim()
}

/** Valores que usa el API/seed para procedureType (valor enviado al backend). */
const PROCEDURE_TYPE_VALUES = [
  { value: 'Wound Dressing', key: 'woundDressing' },
  { value: 'Blood Draw', key: 'bloodDraw' },
  { value: 'Injection', key: 'injection' },
  { value: 'Vital Signs', key: 'vitalSigns' },
  { value: 'Catheterization', key: 'catheterization' },
  { value: 'IV Administration', key: 'ivAdministration' },
] as const

/** Convierte "Wound Dressing" -> "woundDressing" para la clave i18n procedures.types.* */
function procedureTypeToKey(type: string): string {
  return type
    .trim()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('')
}

export function ProcedureListPage() {
  const { t } = useTranslation()
  const [procedures, setProcedures] = useState<NursingProcedure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [procedureType, setProcedureType] = useState('')
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
    getNursingProcedures({
      page,
      limit,
      search: search || undefined,
      procedureType: procedureType || undefined,
    })
      .then((r) => {
        setProcedures(r.procedures)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, limit, search, procedureType, t])

  const columns: DataTableColumn<NursingProcedure>[] = [
    {
      id: 'procedureType',
      label: t('procedures.procedureType'),
      getValue: (row) => row.procedureType,
      sortable: true,
      render: (row) => {
        const key = procedureTypeToKey(row.procedureType)
        const translated = t(`procedures.types.${key}`, { defaultValue: row.procedureType })
        return <span>{translated}</span>
      },
    },
    { id: 'patient', label: t('procedures.patient'), getValue: (row) => patientName(row), sortable: true },
    { id: 'date', label: t('procedures.procedureDate'), getValue: (row) => formatDate(row.procedureDate), sortable: true },
    { id: 'performedBy', label: t('procedures.performedBy'), getValue: (row) => performedByName(row), sortable: true },
  ]

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return procedures
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return procedures
    return [...procedures].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [procedures, sortState, columns])

  const filterValues = { search, procedureType }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearch(value)
    else if (key === 'procedureType') setProcedureType(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setSearch('')
    setProcedureType('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <Link to="/procedures/new" className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium">
          <Plus size={18} />
          {t('procedures.newProcedure')}
        </Link>
      </div>
      <GlassCard>
        <DataTable
          columns={columns}
          data={sortedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage={t('procedures.noProcedures')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            { key: 'search', label: t('common.search'), type: 'text', placeholder: t('procedures.searchPlaceholder'), searchIcon: true, debounceMs: 350 },
            {
              key: 'procedureType',
              label: t('procedures.procedureType'),
              type: 'select',
              options: PROCEDURE_TYPE_VALUES.map(({ value, key }) => ({
                value,
                label: t(`procedures.types.${key}`),
              })),
            },
          ]}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={(row) => (
            <Link to={`/procedures/${row.id}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline">
              <Stethoscope size={16} />
              {t('procedures.viewDetail')}
            </Link>
          )}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="procedimientos"
          exportTitle={t('procedures.title')}
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
