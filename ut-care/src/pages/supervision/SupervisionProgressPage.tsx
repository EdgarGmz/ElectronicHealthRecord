import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import {
  getStaffProgress,
  type StaffProgressItem,
  type StaffProgressPeriod,
} from '@/services/supervision-psychologists.service'

function fullName(row: StaffProgressItem): string {
  return `${row.firstName} ${row.lastName}`.trim()
}

/** Monitoreo de Progreso: métricas de desempeño, pacientes atendidos, estados de expedientes. */
export function SupervisionProgressPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<StaffProgressPeriod>('month')
  const [progress, setProgress] = useState<StaffProgressItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getStaffProgress(period)
      .then((res) => setProgress(res.progress))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [period, t])

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />

      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-[var(--text-primary)]">
            <Activity size={28} className="text-[var(--color-primary)]" />
            <div>
              <h2 className="text-lg font-semibold">{t('supervision.progress.title')}</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('supervision.progress.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="progress-period" className="text-sm font-medium text-[var(--text-primary)]">
              {t('supervision.progress.period')}:
            </label>
            <select
              id="progress-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as StaffProgressPeriod)}
              className="glass-input rounded-lg px-3 py-2 text-sm"
            >
              <option value="week">{t('supervision.progress.periodWeek')}</option>
              <option value="month">{t('supervision.progress.periodMonth')}</option>
              <option value="year">{t('supervision.progress.periodYear')}</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-[var(--color-error)]">{error}</p>
        )}

        {!error && !loading && progress.length === 0 && (
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            {t('supervision.progress.empty')}
          </p>
        )}

        {!error && progress.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-3 pr-4 font-medium text-[var(--text-primary)]">
                    {t('supervision.progress.psychologist')}
                  </th>
                  <th className="py-3 px-4 font-medium text-[var(--text-primary)] text-right">
                    {t('supervision.progress.patientsAttended')}
                  </th>
                  <th className="py-3 px-4 font-medium text-[var(--text-primary)] text-right">
                    {t('supervision.progress.recordsCount')}
                  </th>
                  <th className="py-3 px-4 font-medium text-[var(--text-primary)] text-right">
                    {t('supervision.progress.sessionsCount')}
                  </th>
                  <th className="py-3 px-4 font-medium text-[var(--text-primary)] text-right">
                    {t('supervision.progress.appointmentsCompleted')}
                  </th>
                  <th className="py-3 px-4 font-medium text-[var(--text-primary)] text-right">
                    {t('supervision.progress.appointmentsCancelled')}
                  </th>
                  <th className="py-3 pl-4 font-medium text-[var(--text-primary)] text-right">
                    {t('supervision.progress.appointmentsScheduled')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {progress.map((row) => (
                  <tr
                    key={row.psychologistId}
                    className={`border-b border-[var(--border)] ${!row.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="py-3 pr-4 text-[var(--text-primary)]">
                      {fullName(row)}
                      {!row.isActive && (
                        <span className="ml-2 text-xs text-[var(--text-muted)]">
                          ({t('supervision.psychologists.statusInactive')})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--text-primary)]">
                      {row.patientsAttended}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--text-primary)]">
                      {row.recordsCount}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--text-primary)]">
                      {row.sessionsCount}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--color-success)]">
                      {row.appointmentsCompleted}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--color-error)]">
                      {row.appointmentsCancelled}
                    </td>
                    <td className="py-3 pl-4 text-right text-[var(--text-primary)]">
                      {row.appointmentsScheduled}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
