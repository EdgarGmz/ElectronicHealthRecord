import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import {
  getPsychologists,
  getConsultationsOverTime,
  getWorkloadDistribution,
  type PsychologistWithCareers,
  type AnalyticsGroupBy,
} from '@/services/supervision-psychologists.service'

const CHART_COLORS = {
  appointments: '#8b5cf6',
  sessions: '#06b6d4',
  total: '#22c55e',
  bar: '#6366f1',
}

type PeriodKey = 'week' | 'month' | 'quarter'

function getDateRange(period: PeriodKey): { start: string; end: string } {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date()
  if (period === 'week') {
    start.setDate(start.getDate() - 7)
  } else if (period === 'month') {
    start.setMonth(start.getMonth() - 1)
  } else {
    start.setMonth(start.getMonth() - 3)
  }
  start.setHours(0, 0, 0, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function formatDateLabel(dateStr: string, groupBy: AnalyticsGroupBy): string {
  if (groupBy === 'month') return dateStr
  if (groupBy === 'week') return dateStr
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** Analytics: Line Chart (progresión consultas), Bar (distribución carga por psicólogo). */
export function SupervisionAnalyticsPage() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<PeriodKey>('month')
  const [groupBy, setGroupBy] = useState<AnalyticsGroupBy>('day')
  const [psychologistId, setPsychologistId] = useState<string>('')
  const [psychologists, setPsychologists] = useState<PsychologistWithCareers[]>([])
  const [timeSeries, setTimeSeries] = useState<{ date: string; label: string; appointments: number; sessions: number; total: number }[]>([])
  const [workload, setWorkload] = useState<{ name: string; patients: number; sessions: number; hours: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { start, end } = getDateRange(period)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getConsultationsOverTime(start, end, groupBy, psychologistId || undefined),
      getWorkloadDistribution(start, end),
    ])
      .then(([series, wl]) => {
        setTimeSeries(
          series.map((s) => ({
            date: s.date,
            label: formatDateLabel(s.date, groupBy),
            appointments: s.appointments,
            sessions: s.sessions,
            total: s.total,
          }))
        )
        setWorkload(
          wl.map((w) => ({
            name: w.psychologistName,
            patients: w.patientsCount,
            sessions: w.sessionsCount,
            hours: w.hoursApprox,
          }))
        )
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [start, end, groupBy, psychologistId, t])

  useEffect(() => {
    getPsychologists({ page: 1, limit: 100 })
      .then((r) => setPsychologists(r.users.filter((u) => u.isActive)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('supervision.analytics.loading')} />

      <div className="flex items-center gap-3 text-[var(--text-primary)]">
        <BarChart3 size={28} className="text-[var(--color-primary)]" />
        <div>
          <h2 className="text-lg font-semibold">{t('supervision.analytics.title')}</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {t('supervision.analytics.description')}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}

      <GlassCard className="p-6">
        <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
          {t('supervision.analytics.consultationsOverTime')}
        </h3>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          {t('supervision.analytics.consultationsOverTimeDescription')}
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)]">{t('supervision.analytics.period')}:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
              className="glass-input rounded-lg px-3 py-2 text-sm"
            >
              <option value="week">{t('supervision.analytics.lastWeek')}</option>
              <option value="month">{t('supervision.analytics.lastMonth')}</option>
              <option value="quarter">{t('supervision.analytics.lastQuarter')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)]">{t('supervision.analytics.groupBy')}:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as AnalyticsGroupBy)}
              className="glass-input rounded-lg px-3 py-2 text-sm"
            >
              <option value="day">{t('supervision.analytics.day')}</option>
              <option value="week">{t('supervision.analytics.week')}</option>
              <option value="month">{t('supervision.analytics.month')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)]">{t('supervision.analytics.filterByPsychologist')}:</label>
            <select
              value={psychologistId}
              onChange={(e) => setPsychologistId(e.target.value)}
              className="glass-input min-w-[180px] rounded-lg px-3 py-2 text-sm"
            >
              <option value="">{t('supervision.analytics.allPsychologists')}</option>
              {psychologists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-[280px] w-full">
          {timeSeries.length === 0 && !loading && (
            <p className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
              {t('supervision.analytics.noData')}
            </p>
          )}
          {timeSeries.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  name={t('supervision.analytics.appointments')}
                  stroke={CHART_COLORS.appointments}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  name={t('supervision.analytics.sessions')}
                  stroke={CHART_COLORS.sessions}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name={t('supervision.analytics.total')}
                  stroke={CHART_COLORS.total}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
          {t('supervision.analytics.workloadDistribution')}
        </h3>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          {t('supervision.analytics.workloadDistributionDescription')}
        </p>
        <div className="h-[300px] w-full">
          {workload.length === 0 && !loading && (
            <p className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
              {t('supervision.analytics.noData')}
            </p>
          )}
          {workload.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workload}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={72} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="patients"
                  name={t('supervision.analytics.patients')}
                  fill={CHART_COLORS.bar}
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="sessions"
                  name={t('supervision.analytics.sessionsCount')}
                  fill={CHART_COLORS.sessions}
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="hours"
                  name={t('supervision.analytics.hours')}
                  fill={CHART_COLORS.total}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
