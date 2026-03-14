import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserPlus, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { ROLES_CAN_CREATE_PATIENT, canAccessExpedient } from '@/constants/roles'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getPatients } from '@/services/patient.service'
import type { Patient } from '@/types/patient'

const PATIENT_TYPES = ['student', 'faculty', 'administrative'] as const

export function PatientListPage() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const canCreatePatient = role ? ROLES_CAN_CREATE_PATIENT.includes(role) : false
  const showExpedientLabel = canAccessExpedient(role)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [patientType, setPatientType] = useState('')
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
    getPatients({
      page,
      limit,
      search: search || undefined,
      patientType: patientType || undefined,
    })
      .then((r) => {
        setPatients(r.patients)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, limit, search, patientType, t])

  const fullName = (p: Patient) => `${p.user.firstName} ${p.user.lastName}`.trim()

  const columns: DataTableColumn<Patient>[] = [
    { id: 'name', label: t('nav.patients'), getValue: (row) => fullName(row), sortable: true },
    { id: 'email', label: t('patients.email'), getValue: (row) => row.user.email, sortable: true },
    { id: 'enrollment', label: t('patients.enrollment'), getValue: (row) => row.user.enrollmentNumber ?? '—' },
    { id: 'type', label: t('patients.type'), getValue: (row) => t(`patients.${row.patientType}`) || row.patientType, sortable: true },
    { id: 'career', label: t('patients.career'), getValue: (row) => row.career.name, sortable: true },
  ]

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return patients
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return patients
    return [...patients].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [patients, sortState, columns])

  const filterValues = { search, patientType }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearch(value)
    else if (key === 'patientType') setPatientType(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setSearch('')
    setPatientType('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('nav.patients')}</h1>
        {canCreatePatient && (
          <Link
            to="/patients/new"
            className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition-transform hover:scale-[1.02]"
          >
            <UserPlus size={18} />
            {t('patients.newPatient')}
          </Link>
        )}
      </div>
      <GlassCard className="rounded-2xl overflow-hidden transition-shadow hover:shadow-lg">
        <DataTable
          columns={columns}
          data={sortedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage={t('patients.noPatients')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            { key: 'search', label: t('common.search'), type: 'text', placeholder: t('patients.searchPlaceholder') },
            { key: 'patientType', label: t('patients.type'), type: 'select', options: PATIENT_TYPES.map((type) => ({ value: type, label: t(`patients.${type}`) })) },
          ]}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={(row) => (
            <Link
              to={`/patients/${row.id}`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10 hover:underline"
            >
              <FileText size={16} />
              {showExpedientLabel ? t('patients.viewRecord') : t('patients.viewHistory')}
            </Link>
          )}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="pacientes"
          exportTitle={t('patients.title')}
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
