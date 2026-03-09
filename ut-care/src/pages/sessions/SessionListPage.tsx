import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Plus } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getTherapySessions } from '@/services/therapy-session.service'
import type { TherapySession } from '@/types/therapy-session'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

export function SessionListPage() {
  const { t } = useTranslation()
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: null,
    order: 'asc',
  })

  useEffect(() => {
    setLoading(true)
    setError(null)
    getTherapySessions({ page, limit: 10 })
      .then((r) => {
        setSessions(r.sessions)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, t])

  const patientName = (s: TherapySession) =>
    `${s.psychologyRecord.medicalRecord.patient.user.firstName} ${s.psychologyRecord.medicalRecord.patient.user.lastName}`.trim()
  const therapistName = (s: TherapySession) => `${s.therapist.firstName} ${s.therapist.lastName}`.trim()

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
      id: 'therapist',
      label: t('sessions.therapist'),
      getValue: (row) => therapistName(row),
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
      getValue: (row) => row.mood,
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

  const filterValues = {}
  const onClearFilters = () => {}

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('sessions.title')}</h1>
        <Link
          to="/sessions/new"
          className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium"
        >
          <Plus size={18} />
          {t('sessions.newSession')}
        </Link>
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
          filterValues={filterValues}
          onFilterChange={() => {}}
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
          }}
        />
      </GlassCard>
    </div>
  )
}
