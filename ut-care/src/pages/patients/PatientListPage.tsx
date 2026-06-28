import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserPlus, FileText, Pencil, Trash2, Users } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { ROLES, ROLES_CAN_CREATE_PATIENT, ROLES_CAN_EDIT_PATIENT, ROLES_CAN_DELETE_PATIENTS, canAccessAnyExpedient } from '@/constants/roles'
import { EmailLink } from '@/components/atoms/EmailLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { PhoneWhatsAppLink } from '@/components/atoms/PhoneWhatsAppLink'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getPatients, deletePatient } from '@/services/patient.service'
import { getCareers } from '@/services/career.service'
import { getMyCareers } from '@/services/profile.service'
import type { Patient } from '@/types/patient'
import type { Career } from '@/types/career'

const PATIENT_TYPES = ['student', 'faculty', 'administrative'] as const

export function PatientListPage() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const navigate = useNavigate()
  const canCreatePatient = role ? ROLES_CAN_CREATE_PATIENT.includes(role) : false
  const canEditPatient = role ? ROLES_CAN_EDIT_PATIENT.includes(role) : false
  const canDeletePatient = role ? ROLES_CAN_DELETE_PATIENTS.includes(role) : false
  const showExpedientLabel = canAccessAnyExpedient(role)
  const canClickRow = canAccessAnyExpedient(role)
  const isPsychologist = role === ROLES.PSICOLOGO

  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [patientType, setPatientType] = useState('')
  const [careerId, setCareerId] = useState('')
  const [psychologistCareers, setPsychologistCareers] = useState<Career[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(() => getDefaultTableLimit())
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: null,
    order: 'asc',
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeletePatient, setConfirmDeletePatient] = useState<Patient | null>(null)
  const [successDeleteMessage, setSuccessDeleteMessage] = useState<string | null>(null)

  const fetchPatients = useCallback(() => {
    setLoading(true)
    setError(null)
    getPatients({
      page,
      limit,
      search: search || undefined,
      patientType: patientType || undefined,
      careerId: careerId || undefined,
    })
      .then((r) => {
        setPatients(r.patients)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, limit, search, patientType, careerId, t])

  // Cargar carreras del psicólogo (las que tiene a cargo) solo para rol psicólogo
  useEffect(() => {
    if (!isPsychologist) {
      setPsychologistCareers([])
      return
    }
    Promise.all([getMyCareers(), getCareers()])
      .then(([ids, allCareers]) => {
        const byId = new Set(ids)
        setPsychologistCareers(allCareers.filter((c) => byId.has(c.id)))
      })
      .catch(() => setPsychologistCareers([]))
  }, [isPsychologist])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleDeleteClick = (row: Patient) => {
    setConfirmDeletePatient(row)
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeletePatient) return
    const name = fullName(confirmDeletePatient)
    const id = confirmDeletePatient.id
    setConfirmDeletePatient(null)
    setDeletingId(id)
    try {
      await deletePatient(id)
      await fetchPatients()
      const now = new Date()
      const datetime = now.toLocaleString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      setSuccessDeleteMessage(t('patients.deletedSuccess', { name, datetime }))
    } catch {
      setError(t('common.error'))
    } finally {
      setDeletingId(null)
    }
  }

  const fullName = (p: Patient) => `${p.user.firstName} ${p.user.lastName}`.trim()

  const columns: DataTableColumn<Patient>[] = [
    { id: 'name', label: t('nav.patients'), getValue: (row) => fullName(row), sortable: true },
    {
      id: 'email',
      label: t('patients.email'),
      getValue: (row) => row.user.email,
      sortable: true,
      render: (row) => (row.user.email ? <EmailLink email={row.user.email} /> : '—'),
    },
    {
      id: 'phone',
      label: t('patients.phone'),
      getValue: (row) => row.user.phone ?? '—',
      sortable: true,
      render: (row) =>
        row.user.phone ? <PhoneWhatsAppLink phone={row.user.phone} /> : '—',
    },
    { id: 'enrollment', label: t('patients.enrollment'), getValue: (row) => row.user.enrollmentNumber ?? '—' },
    { id: 'type', label: t('patients.type'), getValue: (row) => t(`patients.${row.patientType}`) || row.patientType, sortable: true },
    { id: 'career', label: t('patients.career'), getValue: (row) => row.career?.name ?? '—', sortable: true },
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

  const filterValues = { search, patientType, careerId }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearch(value)
    else if (key === 'patientType') {
      setPatientType(value)
      if (value === 'faculty' || value === 'administrative') setCareerId('')
    } else if (key === 'careerId') setCareerId(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setSearch('')
    setPatientType('')
    setCareerId('')
    setPage(1)
  }

  const baseFilters = [
    { key: 'search', label: t('common.search'), type: 'text' as const, placeholder: t('patients.searchPlaceholder'), searchIcon: true, debounceMs: 350 },
    { key: 'patientType', label: t('patients.type'), type: 'select' as const, options: PATIENT_TYPES.map((type) => ({ value: type, label: t(`patients.${type}`) })) },
  ]
  const showCareerFilter =
    isPsychologist &&
    psychologistCareers.length > 0 &&
    (patientType === '' || patientType === 'student')
  const careerFilter = showCareerFilter
    ? [{ key: 'careerId', label: t('patients.career'), type: 'select' as const, options: psychologistCareers.map((c) => ({ value: c.id, label: c.name })) }]
    : []
  const filters = [...baseFilters, ...careerFilter]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <ConfirmModal
        open={!!confirmDeletePatient}
        onClose={() => setConfirmDeletePatient(null)}
        onConfirm={handleConfirmDelete}
        title={t('patients.deleteConfirmTitle')}
        message={t('patients.deleteConfirmMessage', { name: confirmDeletePatient ? fullName(confirmDeletePatient) : '' })}
        confirmLabel={t('patients.delete')}
        variant="danger"
        confirming={deletingId !== null}
      />
      <SuccessModal
        open={!!successDeleteMessage}
        onClose={() => setSuccessDeleteMessage(null)}
        message={successDeleteMessage ?? ''}
      />
      {isPsychologist && (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {t('patients.psychologistScopeHint')}
        </p>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="text-[var(--color-primary)]" size={28} />
            {t('patients.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('patients.description')}
          </p>
        </div>
        {canCreatePatient && (
          <div>
            <Link
              to="/patients/new"
              className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition-transform hover:scale-[1.02]"
            >
              <UserPlus size={18} />
              {t('patients.newPatient')}
            </Link>
          </div>
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
          filters={filters}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          onRowClick={canClickRow ? (row) => navigate(`/patients/${row.id}`) : undefined}
          renderActions={(row) => (
            <div className="flex flex-row flex-nowrap items-center gap-2">
              <Link
                to={`/patients/${row.id}`}
                className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--color-primary)] transition-all duration-200 ease-out hover:scale-110 hover:bg-[var(--color-primary)]/10"
                title={showExpedientLabel ? t('patients.viewRecord') : t('patients.viewHistory')}
                aria-label={showExpedientLabel ? t('patients.viewRecord') : t('patients.viewHistory')}
              >
                <FileText size={18} />
              </Link>
              {canEditPatient && (
                <Link
                  to={`/patients/${row.id}/edit`}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--text-secondary)] transition-all duration-200 ease-out hover:scale-110 hover:bg-[var(--bg)]/50 hover:text-[var(--text-primary)]"
                  title={t('patients.edit')}
                  aria-label={t('patients.edit')}
                >
                  <Pencil size={18} />
                </Link>
              )}
              {canDeletePatient && (
                <button
                  type="button"
                  onClick={() => handleDeleteClick(row)}
                  disabled={deletingId === row.id}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--color-error)] transition-all duration-200 ease-out hover:scale-110 hover:bg-[var(--color-error)]/10 disabled:opacity-50 disabled:hover:scale-100"
                  title={t('patients.delete')}
                  aria-label={t('patients.delete')}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
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
