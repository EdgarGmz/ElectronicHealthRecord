import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarPlus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getAppointments } from '@/services/appointment.service'
import type { Appointment } from '@/types/appointment'
import { APPOINTMENT_STATUS, DEPARTMENT_KEYS } from '@/types/appointment'

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
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAppointments({ page, limit: 10, status: status || undefined, department: department || undefined })
      .then((r) => {
        setAppointments(r.appointments)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, status, department, t])

  const patientName = (a: Appointment) => `${a.patient.user.firstName} ${a.patient.user.lastName}`.trim()
  const professionalName = (a: Appointment) => `${a.professional.firstName} ${a.professional.lastName}`.trim()

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('appointments.title')}</h1>
        <Link to="/appointments/new" className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium">
          <CalendarPlus size={18} />
          {t('appointments.newAppointment')}
        </Link>
      </div>
      <GlassCard>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">{t('appointments.status')}</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="glass-input w-40 px-3 py-2 text-sm">
              <option value="">{t('patients.typeAll')}</option>
              {Object.entries(STATUS_KEYS).map(([value, key]) => (
                <option key={value} value={value}>{t(`appointments.${key}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">{t('appointments.department')}</label>
            <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1) }} className="glass-input w-40 px-3 py-2 text-sm">
              <option value="">{t('patients.typeAll')}</option>
              {Object.entries(DEPARTMENT_KEYS).map(([value, key]) => (
                <option key={value} value={value}>{t(`appointments.${key}`)}</option>
              ))}
            </select>
          </div>
        </div>
        {loading ? null : appointments.length === 0 ? (
          <p className="py-8 text-center text-[var(--text-secondary)]">{t('appointments.noAppointments')}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('appointments.patient')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('appointments.professional')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('appointments.date')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('appointments.duration')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('appointments.department')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('appointments.status')}</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-[var(--border)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{patientName(apt)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{professionalName(apt)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDateTime(apt.scheduledDate)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{apt.durationMinutes} {t('appointments.minutes')}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{DEPARTMENT_KEYS[apt.department] ? t(`appointments.${DEPARTMENT_KEYS[apt.department]}`) : apt.department}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{STATUS_KEYS[apt.status] ? t(`appointments.${STATUS_KEYS[apt.status]}`) : apt.status}</td>
                      <td className="px-4 py-3">
                        <Link to={`/appointments/${apt.id}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline">
                          <Calendar size={16} />
                          {t('appointments.viewDetail')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <p className="text-sm text-[var(--text-muted)]">{t('appointments.page')} {pagination.page} {t('appointments.of')} {pagination.totalPages}</p>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="glass-button inline-flex items-center gap-1 disabled:opacity-50">
                    <ChevronLeft size={18} />
                    {t('appointments.previous')}
                  </button>
                  <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} className="glass-button inline-flex items-center gap-1 disabled:opacity-50">
                    {t('appointments.next')}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  )
}
