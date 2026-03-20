import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarPlus, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
import { ROLES_CAN_CREATE_APPOINTMENT } from '@/constants/roles'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { DataTable } from '@/components/organisms/DataTable'
import type { DataTableColumn } from '@/components/organisms/DataTable'
import { getAppointments } from '@/services/appointment.service'
import type { Appointment } from '@/types/appointment'
import { APPOINTMENT_STATUS } from '@/types/appointment'

const STATUS_KEYS: Record<string, string> = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'statusScheduled',
  [APPOINTMENT_STATUS.CONFIRMED]: 'statusConfirmed',
  [APPOINTMENT_STATUS.COMPLETED]: 'statusCompleted',
  [APPOINTMENT_STATUS.CANCELLED]: 'statusCancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'statusNoShow',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

export function AppointmentListPage() {
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const canCreateAppointment = role ? ROLES_CAN_CREATE_APPOINTMENT.includes(role) : false
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(() => getDefaultTableLimit())
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [sortState, setSortState] = useState<{ columnId: string | null; order: 'asc' | 'desc' }>({
    columnId: null,
    order: 'asc',
  })

  useEffect(() => {
    // Evita setState "sincrónico" directamente en el body del effect para cumplir la regla del lint.
    void Promise.resolve().then(() => {
      setLoading(true)
      setError(null)
    })

    getAppointments({
      page,
      limit,
      status: status || undefined,
      search: search || undefined,
    })
      .then((r) => {
        setAppointments(r.appointments)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, limit, status, search, t])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      // Refresco silencioso para que se vean cambios de estado (ej. completada).
      void getAppointments({
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
      }).then((r) => {
        setAppointments(r.appointments)
        setPagination(r.pagination)
      })
    }, 10000)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void getAppointments({
          page,
          limit,
          status: status || undefined,
          search: search || undefined,
        }).then((r) => {
          setAppointments(r.appointments)
          setPagination(r.pagination)
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [page, limit, status, search])

  const patientName = (a: Appointment) =>
    `${a.patient.user.firstName} ${a.patient.user.lastName}`.trim()

  const columns: DataTableColumn<Appointment>[] = [
    {
      id: 'patient',
      label: t('appointments.patient'),
      getValue: (row) => patientName(row),
      sortable: true,
    },
    {
      id: 'date',
      label: t('appointments.date'),
      getValue: (row) => formatDateTime(row.scheduledDate),
      sortable: true,
    },
    {
      id: 'duration',
      label: t('appointments.duration'),
      getValue: (row) => `${row.durationMinutes} ${t('appointments.minutes')}`,
    },
    {
      id: 'status',
      label: t('appointments.status'),
      getValue: (row) =>
        STATUS_KEYS[row.status] ? t(`appointments.${STATUS_KEYS[row.status]}`) : row.status,
      sortable: true,
      type: 'status',
      statusMap: {
        [t('appointments.statusCompleted')]: 'success',
        [t('appointments.statusCancelled')]: 'error',
        [t('appointments.statusNoShow')]: 'error',
        [t('appointments.statusScheduled')]: 'warning',
        [t('appointments.statusConfirmed')]: 'warning',
      },
    },
  ]

  const sortedData = useMemo(() => {
    if (!sortState.columnId) return appointments
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col) return appointments
    return [...appointments].sort((a, b) => {
      const va = col.getValue(a)
      const vb = col.getValue(b)
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortState.order === 'asc' ? cmp : -cmp
    })
  }, [appointments, sortState, columns])

  const filterValues = { search, status }
  const onFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearch(value)
    else if (key === 'status') setStatus(value)
    setPage(1)
  }
  const onClearFilters = () => {
    setSearch('')
    setStatus('')
    setPage(1)
  }

  const rowVariant = (row: Appointment): 'success' | 'warning' | 'error' | 'default' => {
    if (row.status === APPOINTMENT_STATUS.COMPLETED) return 'success'
    if (row.status === APPOINTMENT_STATUS.CANCELLED || row.status === APPOINTMENT_STATUS.NO_SHOW)
      return 'error'
    return 'warning'
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        {canCreateAppointment && (
          <Link
            to="/appointments/new"
            className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium"
          >
            <CalendarPlus size={18} />
            {t('appointments.newAppointment')}
          </Link>
        )}
      </div>
      <GlassCard>
        <DataTable
          columns={columns}
          data={sortedData}
          getRowId={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage={t('appointments.noAppointments')}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1) }}
          filters={[
            {
              key: 'search',
              label: t('common.search'),
              type: 'text',
              placeholder: t('appointments.searchByName'),
              searchIcon: true,
              debounceMs: 350,
            },
            {
              key: 'status',
              label: t('appointments.status'),
              type: 'select',
              options: Object.entries(STATUS_KEYS).map(([value, key]) => ({
                value,
                label: t(`appointments.${key}`),
              })),
            },
          ]}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          sortState={sortState}
          onSort={(columnId, order) => setSortState({ columnId, order })}
          renderActions={(row) => (
            <Link
              to={`/appointments/${row.id}`}
              className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
            >
              <Calendar size={16} />
              {t('appointments.viewDetail')}
            </Link>
          )}
          rowVariant={rowVariant}
          exportFormats={['pdf', 'csv', 'xlsx']}
          exportFilename="citas"
          exportTitle={t('appointments.title')}
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
