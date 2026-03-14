import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  Stethoscope,
  Pill,
  ArrowRight,
  Activity,
  Loader2,
  ClipboardList,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useAuthStore } from '@/store/auth.store'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getPatients } from '@/services/patient.service'
import { getAppointments } from '@/services/appointment.service'
import { getNursingProcedures } from '@/services/nursing-procedure.service'
import { getMedications } from '@/services/medication.service'
import { getDashboardChartData } from '@/services/dashboard-charts.service'
import type { PeriodType } from '@/types/dashboard-charts'

const NURSING_COLOR = '#059669'
const NURSING_COLOR_LIGHT = '#10b981'

function getDateRange(periodType: PeriodType, periodsBack: number): { startDate: string; endDate: string } {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date()
  if (periodType === 'day') {
    start.setDate(start.getDate() - periodsBack)
  } else if (periodType === 'month') {
    start.setMonth(start.getMonth() - periodsBack)
  } else {
    start.setFullYear(start.getFullYear() - periodsBack)
  }
  start.setHours(0, 0, 0, 0)
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }
}

function getTodayRange(): { startDate: string; endDate: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

interface KpiCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  to?: string
}

function KpiCard({ label, value, icon, to }: KpiCardProps) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border-l-4 border-l-[var(--color-primary)] bg-[var(--glass-bg)] p-5 shadow-sm transition-shadow hover:shadow-lg">
      <div className="flex shrink-0 rounded-xl bg-[var(--bg-secondary)] p-3">{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
      {to && <ArrowRight size={16} className="ml-auto shrink-0 text-[var(--text-muted)]" />}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export function DashboardCoordinatorNursing() {
  const { t } = useTranslation()
  const [totalPatients, setTotalPatients] = useState<number | null>(null)
  const [appointmentsToday, setAppointmentsToday] = useState<number | null>(null)
  const [totalProcedures, setTotalProcedures] = useState<number | null>(null)
  const [totalMedications, setTotalMedications] = useState<number | null>(null)
  const [chartData, setChartData] = useState<Awaited<ReturnType<typeof getDashboardChartData>> | null>(null)
  const [chartPeriod, setChartPeriod] = useState<PeriodType>('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = useAuthStore((s) => s.user)
  const firstName = user?.firstName ?? t('dashboard.coordinatorNursing.coordinator')
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const { startDate: chartStart, endDate: chartEnd } = useMemo(
    () => (chartPeriod === 'month' ? getDateRange('month', 5) : getDateRange('day', 14)),
    [chartPeriod]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const todayRange = getTodayRange()

    Promise.all([
      getPatients({ page: 1, limit: 1 }).then((r) => r.pagination.total),
      getAppointments({
        page: 1,
        limit: 1,
        startDate: todayRange.startDate,
        endDate: todayRange.endDate,
      }).then((r) => r.pagination.total),
      getNursingProcedures({ page: 1, limit: 1 }).then((r) => r.pagination.total),
      getMedications({ page: 1, limit: 1 }).then((r) => r.pagination.total),
      getDashboardChartData({
        periodType: chartPeriod,
        startDate: chartStart,
        endDate: chartEnd,
      }).catch(() => null),
    ])
      .then(([patients, appointments, procedures, medications, charts]) => {
        if (cancelled) return
        setTotalPatients(patients)
        setAppointmentsToday(appointments)
        setTotalProcedures(procedures)
        setTotalMedications(medications)
        setChartData(charts)
      })
      .catch(() => {
        if (!cancelled) setError(t('common.error'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [t, chartStart, chartEnd, chartPeriod])

  const nursingByPeriod = useMemo(() => {
    if (!chartData?.byPeriod?.length) return []
    return chartData.byPeriod.map((p) => ({
      period: p.period,
      consultas: p.nursing,
    }))
  }, [chartData])

  const heatmapNursing = useMemo(() => {
    if (!chartData?.heatmap?.length) return []
    return chartData.heatmap.map((h) => ({
      day: h.dayName,
      consultas: h.nursing,
    }))
  }, [chartData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinatorNursing.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <GlassCard>
        <p className="text-[var(--color-error)]">{error}</p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('dashboard.coordinatorNursing.welcome')}, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-sm capitalize text-[var(--text-muted)]">{today}</p>
        </div>
        <Link
          to="/patients"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          <Users size={16} />
          {t('dashboard.coordinatorNursing.goToPatients')}
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('dashboard.coordinatorNursing.totalPatients')}
          value={totalPatients ?? '—'}
          icon={<Users size={22} className="text-[var(--color-primary)]" />}
          to="/patients"
        />
        <KpiCard
          label={t('dashboard.coordinatorNursing.appointmentsToday')}
          value={appointmentsToday ?? '—'}
          icon={<Calendar size={22} className="text-[var(--color-primary)]" />}
        />
        <KpiCard
          label={t('dashboard.coordinatorNursing.totalProcedures')}
          value={totalProcedures ?? '—'}
          icon={<Stethoscope size={22} style={{ color: NURSING_COLOR }} />}
          to="/procedures"
        />
        <KpiCard
          label={t('dashboard.coordinatorNursing.totalMedications')}
          value={totalMedications ?? '—'}
          icon={<Pill size={22} style={{ color: NURSING_COLOR }} />}
          to="/medications"
        />
      </div>

      {/* Charts */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Activity size={20} style={{ color: NURSING_COLOR }} />
          {t('dashboard.coordinatorNursing.chartsTitle')}
        </h2>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-[var(--text-secondary)]">{t('dashboard.coordinatorNursing.period')}:</label>
          <select
            value={chartPeriod}
            onChange={(e) => setChartPeriod(e.target.value as PeriodType)}
            className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
          >
            <option value="day">{t('dashboard.coordinatorNursing.last14Days')}</option>
            <option value="month">{t('dashboard.coordinatorNursing.last6Months')}</option>
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Consultas en el tiempo */}
          <GlassCard className="rounded-2xl transition-shadow hover:shadow-xl">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
              <ClipboardList size={18} style={{ color: NURSING_COLOR }} />
              {t('dashboard.coordinatorNursing.consultationsOverTime')}
            </h3>
            {nursingByPeriod.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                {t('dashboard.coordinatorNursing.noData')}
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nursingByPeriod} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [value, t('dashboard.coordinatorNursing.consultations')]}
                    />
                    <Bar dataKey="consultas" fill={NURSING_COLOR} radius={[4, 4, 0, 0]} name={t('dashboard.coordinatorNursing.consultations')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          {/* Distribución por día de la semana */}
          <GlassCard className="rounded-2xl transition-shadow hover:shadow-xl">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
              <Calendar size={18} style={{ color: NURSING_COLOR }} />
              {t('dashboard.coordinatorNursing.heatmapByDay')}
            </h3>
            {heatmapNursing.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                {t('dashboard.coordinatorNursing.noData')}
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatmapNursing} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="consultas" radius={[4, 4, 0, 0]}>
                      {heatmapNursing.map((_, i) => (
                        <Cell key={i} fill={NURSING_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          {/* Histograma: consultas por expediente */}
          {chartData?.histogramNursing?.length ? (
            <GlassCard className="rounded-2xl transition-shadow hover:shadow-xl lg:col-span-2">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                <Stethoscope size={18} style={{ color: NURSING_COLOR }} />
                {t('dashboard.coordinatorNursing.histogramTitle')}
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.histogramNursing}
                    margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="bucket" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill={NURSING_COLOR_LIGHT} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          ) : null}
        </div>
      </section>

      {/* Accesos rápidos */}
      <GlassCard className="rounded-2xl border-l-4 border-l-[var(--color-primary)]">
        <h2 className="mb-3 text-base font-semibold text-[var(--text-primary)]">
          {t('dashboard.coordinatorNursing.quickAccess')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <Users size={18} />
            {t('nav.patients')}
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/medications"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <Pill size={18} />
            {t('nav.medications')}
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/procedures"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <Stethoscope size={18} />
            {t('nav.procedures')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
