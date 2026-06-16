import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { getTherapySessions } from '@/services/therapy-session.service'
import { getPatients } from '@/services/patient.service'
import { getPsychologists } from '@/services/supervision-psychologists.service'
import { getMyCareers } from '@/services/profile.service'
import { getMoods } from '@/services/mood.service'
import type { TherapySession } from '@/types/therapy-session'
import type { Mood } from '@/types/mood'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

export function SessionListPage() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const isCoordinator = role === ROLES.COORDINADOR_PSICOLOGIA

  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(() => getDefaultTableLimit())
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: null,
    order: 'asc',
  })
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [patientId, setPatientId] = useState('')
  const [therapistId, setTherapistId] = useState('')
  const [patientOptions, setPatientOptions] = useState<{ value: string; label: string }[]>([])
  const [therapistOptions, setTherapistOptions] = useState<{ value: string; label: string }[]>([])
  const [moods, setMoods] = useState<Mood[]>([])

  // Psicólogo: filtro de Paciente solo muestra pacientes de sus carreras encargadas (+ docente/administrativo)
  useEffect(() => {
    const isPsychologist = role === ROLES.PSICOLOGO
    if (!isPsychologist) {
      setPatientOptions([])
      return
    }
    Promise.all([getMyCareers().catch(() => [] as string[]), getPatients({ limit: 300 })])
      .then(([careerIds, r]) => {
        const allowed =
          careerIds.length === 0
            ? (p: { patientType: string }) => p.patientType === 'faculty' || p.patientType === 'administrative'
            : (p: { patientType: string; careerId: string | null }) =>
                p.patientType === 'faculty' ||
                p.patientType === 'administrative' ||
                (p.patientType === 'student' && p.careerId != null && careerIds.includes(p.careerId))
        setPatientOptions(
          r.patients.filter(allowed).map((p) => ({
            value: p.id,
            label: `${p.user.firstName} ${p.user.lastName}`.trim() || p.id,
          }))
        )
      })
      .catch(() => setPatientOptions([]))
  }, [role])

  useEffect(() => {
    getMoods().then(setMoods).catch(() => setMoods([]))
  }, [])

  useEffect(() => {
    if (!isCoordinator) {
      setTherapistOptions([])
      return
    }
    getPsychologists({ page: 1, limit: 200 })
      .then((r) =>
        setTherapistOptions(
          r.users.map((u) => ({
            value: u.id,
            label: `${u.firstName} ${u.lastName}`.trim() || u.id,
          }))
        )
      )
      .catch(() => setTherapistOptions([]))
  }, [isCoordinator])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getTherapySessions({
      page,
      limit,
      patientId: patientId || undefined,
      therapistId: therapistId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: search.trim() || undefined,
    })
      .then((r) => {
        setSessions(r.sessions)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, limit, patientId, therapistId, dateFrom, dateTo, search, t])

  const patientName = (s: TherapySession) =>
    `${s.psychologyRecord.medicalRecord.patient.user.firstName} ${s.psychologyRecord.medicalRecord.patient.user.lastName}`.trim()

  const moodByCode = useMemo(() => new Map(moods.map((m) => [m.code, m])), [moods])
  const formatMoodCell = (row: TherapySession) => {
    if (!row.mood?.trim()) return '—'
    const codes = row.mood.split(',').map((c) => c.trim()).filter(Boolean)
    return codes.map((code) => {
      const m = moodByCode.get(code)
      return m ? `${m.emoji} ${m.name}` : code
    }).join(', ')
  }

  const columns: DataTableColumn<TherapySession>[] = [
    {
      id: 'sessionNumber',
      label: t('sessions.sessionNumber'),
      getValue: (row) => row.sessionNumber,
      sortable: true,
    },
    {
      id: 'patient',
      label: t('sessions.patient'),
      getValue: (row) => patientName(row),
      sortable: true,
    },
    {
      id: 'date',
      label: t('sessions.date'),
      getValue: (row) => formatDateTime(row.sessionDate),
      sortable: true,
    },
    {
      id: 'duration',
      label: t('sessions.duration'),
      getValue: (row) => `${row.sessionDuration} ${t('sessions.minutes')}`,
    },
    {
      id: 'mood',
      label: t('sessions.mood'),
      getValue: (row) => formatMoodCell(row),
      render: (row) => (
        <span className="inline-flex flex-wrap items-center gap-1">
          {row.mood?.trim()
            ? row.mood.split(',').map((c) => c.trim()).filter(Boolean).map((code) => {
                const m = moodByCode.get(code)
                const label = m ? m.name : code
                return (
                  <span
                    key={code}
                    title={label}
                    className="cursor-default text-lg leading-none transition-transform duration-200 ease-out hover:scale-125 inline-block"
                    aria-label={label}
                  >
                    {m ? m.emoji : '•'}
                  </span>
                )
              })
            : '—'}
        </span>
      ),
      sortable: true,
    },
  ]

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return sessions
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return sessions
    return [...sessions].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [sessions, sortState, columns])

  const baseFilters: { key: string; label: string; type: 'text' | 'select' | 'date'; placeholder?: string; searchIcon?: boolean; debounceMs?: number; options?: { value: string; label: string }[] }[] = [
    { key: 'search', label: t('sessions.filterSearch'), type: 'text', placeholder: t('sessions.filterSearchPlaceholder'), searchIcon: true, debounceMs: 400 },
    { key: 'dateFrom', label: t('sessions.filterDateFrom'), type: 'date' },
    { key: 'dateTo', label: t('sessions.filterDateTo'), type: 'date' },
    { key: 'patientId', label: t('sessions.patient'), type: 'select', options: [{ value: '', label: t('table.all') || 'Todos' }, ...patientOptions] },
  ]
  if (isCoordinator && therapistOptions.length > 0) {
    baseFilters.push({ key: 'therapistId', label: t('sessions.therapist'), type: 'select', options: [{ value: '', label: t('table.all') || 'Todos' }, ...therapistOptions] })
  }
  const filters = baseFilters

  const filterValues = { search, dateFrom, dateTo, patientId, therapistId }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearch(value)
    else if (key === 'dateFrom') setDateFrom(value)
    else if (key === 'dateTo') setDateTo(value)
    else if (key === 'patientId') setPatientId(value)
    else if (key === 'therapistId') setTherapistId(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setPatientId('')
    setTherapistId('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="text-[var(--color-primary)]" size={28} />
            {t('sessions.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('sessions.description')}
          </p>
        </div>
        <div>
          <Link
            to="/sessions/new"
            className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition-transform hover:scale-[1.02]"
          >
            <Plus size={18} />
            {t('sessions.newSession')}
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
          emptyMessage={t('sessions.noSessions')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={(row) => (
            <Link
              to={`/sessions/${row.id}`}
              className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
            >
              <FileText size={16} />
              {t('sessions.viewDetail')}
            </Link>
          )}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="sesiones"
          exportTitle={t('sessions.title')}
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
