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
  Clock,
  Boxes,
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
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
} from 'recharts'
import { useAuthStore } from '@/store/auth.store'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getPatients } from '@/services/patient.service'
import { getAppointments } from '@/services/appointment.service'
import { getMedications } from '@/services/medication.service'
import { getDashboardChartData } from '@/services/dashboard-charts.service'
import {
  getNursingStaffProgress,
  type NursingStaffProgressItem,
  type NursingStaffProgressPeriod,
} from '@/services/dashboard-nursing-staff-progress.service'
import {
  getMedicationStockSummary,
  type MedicationStockSummary,
  type MedicationStockLevel,
} from '@/services/dashboard-medication-stock.service'
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

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function getStockColor(level: MedicationStockLevel): { fill: string; badge: string } {
  const map: Record<MedicationStockLevel, { fill: string; badge: string }> = {
    low: { fill: '#ef4444', badge: 'bg-red-500/15 text-red-700 border-red-400/40' },
    medium: { fill: '#f59e0b', badge: 'bg-amber-500/15 text-amber-700 border-amber-400/40' },
    high: { fill: '#059669', badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-400/40' },
  }
  return map[level]
}

function getMovementBadge(itemName: string): string {
  if (!itemName) return 'Enfermería'
  const n = itemName.toLowerCase()
  if (n.startsWith('procedimiento')) return 'Procedimientos'
  if (n.startsWith('administración') || n.startsWith('administracion')) return 'Medicamentos'
  if (n.startsWith('consulta')) return 'Consultas'
  return 'Enfermería'
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
  const [totalMedications, setTotalMedications] = useState<number | null>(null)
  const [chartData, setChartData] = useState<Awaited<ReturnType<typeof getDashboardChartData>> | null>(null)
  const [chartPeriod, setChartPeriod] = useState<PeriodType>('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stockSummary, setStockSummary] = useState<MedicationStockSummary | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [stockError, setStockError] = useState<string | null>(null)

  const [staffProgress, setStaffProgress] = useState<NursingStaffProgressItem[]>([])
  const [staffPeriod, setStaffPeriod] = useState<NursingStaffProgressPeriod>('month')
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffError, setStaffError] = useState<string | null>(null)

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

    const patientsPromise = getPatients({ page: 1, limit: 1 }).then((r) => r.pagination.total)
    const appointmentsPromise = getAppointments({
      page: 1,
      limit: 1,
      startDate: todayRange.startDate,
      endDate: todayRange.endDate,
    }).then((r) => r.pagination.total)
    const medicationsPromise = getMedications({ page: 1, limit: 1 }).then((r) => r.pagination.total)
    const chartsPromise = getDashboardChartData({
      periodType: chartPeriod,
      startDate: chartStart,
      endDate: chartEnd,
    }).catch(() => null)

    Promise.allSettled([patientsPromise, appointmentsPromise, medicationsPromise, chartsPromise])
      .then((results) => {
        if (cancelled) return
        const [patientsRes, appointmentsRes, medicationsRes, chartsRes] = results

        if (patientsRes.status === 'fulfilled') setTotalPatients(patientsRes.value)
        if (appointmentsRes.status === 'fulfilled') setAppointmentsToday(appointmentsRes.value)
        if (medicationsRes.status === 'fulfilled') setTotalMedications(medicationsRes.value)
        if (chartsRes.status === 'fulfilled') setChartData(chartsRes.value)

        // Si todo falla, mostramos el error global.
        const allFailed =
          patientsRes.status === 'rejected' &&
          appointmentsRes.status === 'rejected' &&
          medicationsRes.status === 'rejected' &&
          chartsRes.status === 'rejected'
        if (allFailed) setError(t('common.error'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [t, chartStart, chartEnd, chartPeriod])

  useEffect(() => {
    let cancelled = false
    setStockLoading(true)
    setStockError(null)

    getMedicationStockSummary()
      .then((data) => {
        if (cancelled) return
        setStockSummary(data)
      })
      .catch(() => {
        if (cancelled) return
        setStockError(t('common.error', 'Ocurrió un error al cargar el stock'))
      })
      .finally(() => {
        if (cancelled) return
        setStockLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  useEffect(() => {
    let cancelled = false
    setStaffLoading(true)
    setStaffError(null)

    getNursingStaffProgress(staffPeriod)
      .then((res) => {
        if (cancelled) return
        setStaffProgress(res.progress)
      })
      .catch(() => {
        if (cancelled) return
        setStaffError(t('common.error', 'Ocurrió un error al cargar la supervisión'))
      })
      .finally(() => {
        if (cancelled) return
        setStaffLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [staffPeriod, t])

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

  const nursingTimeline = useMemo(() => {
    const items = chartData?.timeline?.filter((i) => i.type === 'nursing') ?? []
    return items
      .slice()
      .sort((a, b) => b.start.localeCompare(a.start))
      .slice(0, 8)
  }, [chartData])

  const scatterPoints = useMemo(() => {
    const items = chartData?.scatter ?? []
    return items.map((p) => ({
      period: p.period,
      psychology: p.psychology,
      nursing: p.nursing,
      x: p.psychology,
      y: p.nursing,
    }))
  }, [chartData])

  const radarData = useMemo(() => chartData?.radar ?? [], [chartData])

  const staffList = useMemo(() => {
    const sorted = staffProgress.slice().sort((a, b) => b.patientsAttended - a.patientsAttended)
    return sorted
  }, [staffProgress])

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      formatter={(value: unknown) => {
                        const n = typeof value === 'number' ? value : Number(value ?? 0)
                        return [Number.isFinite(n) ? n : 0, t('dashboard.coordinatorNursing.consultations')]
                      }}
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

          {/* Scatter: correlación psicología vs enfermería */}
          <GlassCard className="rounded-2xl transition-shadow hover:shadow-xl">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
              <Activity size={18} style={{ color: NURSING_COLOR }} />
              {t('dashboard.coordinatorNursing.scatterTitle', 'Correlación psicología vs enfermería')}
            </h3>
            {scatterPoints.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                {t('dashboard.coordinatorNursing.noData')}
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" dataKey="x" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis type="number" dataKey="y" stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: unknown, name: unknown) => {
                        const n = typeof value === 'number' ? value : Number(value ?? 0)
                        const key = String(name ?? '')
                        return [Number.isFinite(n) ? n : 0, key === 'x' ? 'Psicología' : 'Enfermería']
                      }}
                    />
                    <Scatter name={t('dashboard.coordinatorNursing.nursing', 'Enfermería')} data={scatterPoints} fill={NURSING_COLOR} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          {/* Radar: comparación de métricas */}
          <GlassCard className="rounded-2xl transition-shadow hover:shadow-xl">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
              <Stethoscope size={18} style={{ color: NURSING_COLOR }} />
              {t('dashboard.coordinatorNursing.radarTitle', 'Radar de métricas')}
            </h3>
            {radarData.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                {t('dashboard.coordinatorNursing.noData')}
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" />
                    <PolarRadiusAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Radar
                      name={t('dashboard.coordinatorNursing.nursing', 'Enfermería')}
                      dataKey="nursing"
                      stroke={NURSING_COLOR}
                      fill={NURSING_COLOR}
                      fillOpacity={0.25}
                    />
                    <Radar
                      name={t('dashboard.coordinatorNursing.psychology', 'Psicología')}
                      dataKey="psychology"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.12}
                    />
                  </RadarChart>
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

      {/* Últimos movimientos */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Clock size={20} style={{ color: NURSING_COLOR }} />
          {t('dashboard.coordinatorNursing.latestMovementsTitle', 'Últimos movimientos en el departamento')}
        </h2>
        <GlassCard className="rounded-2xl p-5">
          {nursingTimeline.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">
              {t('dashboard.coordinatorNursing.noData', 'Sin datos')}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto pr-1">
              {nursingTimeline.map((item) => (
                <li key={`${item.name}-${item.start}`} className="py-3 flex flex-wrap items-center gap-3">
                  <div className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <Clock size={14} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDateTime(item.start)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full border border-[var(--border)] text-[var(--text-secondary)]">
                      {getMovementBadge(item.name)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </section>

      {/* Control de stock */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Boxes size={20} style={{ color: NURSING_COLOR }} />
          {t('dashboard.coordinatorNursing.stockControlTitle', 'Control de stock')}
        </h2>
        <GlassCard className="rounded-2xl p-5">
          {stockLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--text-muted)]">
                {t('dashboard.coordinatorNursing.loadingStock', 'Cargando stock…')}
              </p>
            </div>
          ) : stockError ? (
            <p className="text-sm text-[var(--color-error)]">{stockError}</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {t('dashboard.coordinatorNursing.stockDistribution', 'Distribución por nivel')}
                  </p>
                  <span className="text-xs text-[var(--text-muted)]">
                    {stockSummary
                      ? `${stockSummary.distribution.low + stockSummary.distribution.medium + stockSummary.distribution.high} medicamentos`
                      : ''}
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: t('medications.stockLow', 'Bajo'), value: stockSummary?.distribution.low ?? 0, ...getStockColor('low') },
                          { name: t('medications.stockMedium', 'Medio'), value: stockSummary?.distribution.medium ?? 0, ...getStockColor('medium') },
                          { name: t('medications.stockHigh', 'Alto'), value: stockSummary?.distribution.high ?? 0, ...getStockColor('high') },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {[
                          getStockColor('low'),
                          getStockColor('medium'),
                          getStockColor('high'),
                        ].map((c, i) => (
                          <Cell key={i} fill={c.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--glass-bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: unknown, name: unknown) => {
                          const n = typeof value === 'number' ? value : Number(value ?? 0)
                          return [Number.isFinite(n) ? n : 0, String(name ?? '')]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                  {t('dashboard.coordinatorNursing.lowStockTitle', 'Medicamentos con stock bajo')}
                </p>
                {stockSummary?.lowStock.length ? (
                  <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {stockSummary.lowStock.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 text-sm py-2 border-b border-[var(--border)] last:border-0">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]`}>
                          <Pill size={16} className="text-red-400" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[var(--text-primary)] truncate">{m.name}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">Stock: {m.stock}</p>
                        </div>
                        <span className={getStockColor('low').badge + ' border'}>Bajo</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    {t('dashboard.coordinatorNursing.noLowStock', 'No hay medicamentos con stock bajo')}
                  </p>
                )}
              </div>
            </div>
          )}
        </GlassCard>
      </section>

      {/* Control de personal / supervisión */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
            <Users size={20} style={{ color: NURSING_COLOR }} />
            {t('dashboard.coordinatorNursing.personalControlTitle', 'Control de personal (supervisión)')}
          </h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-[var(--text-secondary)]">
              {t('dashboard.coordinatorNursing.period', 'Periodo')}:
            </label>
            <select
              value={staffPeriod}
              onChange={(e) => setStaffPeriod(e.target.value as NursingStaffProgressPeriod)}
              className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
            >
              <option value="week">{t('common.week', 'Semana')}</option>
              <option value="month">{t('common.month', 'Mes')}</option>
              <option value="year">{t('common.year', 'Año')}</option>
            </select>
          </div>
        </div>

        <GlassCard className="rounded-2xl p-5">
          {staffLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--text-muted)]">
                {t('dashboard.coordinatorNursing.loadingStaff', 'Cargando supervisión…')}
              </p>
            </div>
          ) : staffError ? (
            <p className="text-sm text-[var(--color-error)]">{staffError}</p>
          ) : staffList.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">
              {t('dashboard.coordinatorNursing.noData', 'Sin datos')}
            </p>
          ) : (
            <div className="space-y-5">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={staffList.slice(0, 8).map((s) => ({ name: `${s.firstName} ${s.lastName}`.trim(), patientsAttended: s.patientsAttended }))}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={170}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tick={{ fill: 'var(--text-muted)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: unknown) => {
                        const n = typeof value === 'number' ? value : Number(value ?? 0)
                        return [Number.isFinite(n) ? n : 0, t('dashboard.coordinatorNursing.patientsAttended', 'Pacientes atendidos')]
                      }}
                    />
                    <Bar dataKey="patientsAttended" fill={NURSING_COLOR} radius={[0, 4, 4, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ul className="divide-y divide-[var(--border)]">
                {staffList.slice(0, 8).map((s) => (
                  <li key={s.nurseId} className="py-3 flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Pacientes: {s.patientsAttended} · Consultas: {s.consultationsCount} · Procedimientos: {s.proceduresCount} · Medicación: {s.medicationAdministrationsCount}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        s.isActive
                          ? 'bg-emerald-500/15 text-emerald-700 border-emerald-400/40'
                          : 'bg-amber-500/15 text-amber-700 border-amber-400/40'
                      }`}
                    >
                      {s.isActive ? t('common.active', 'Activo') : t('common.inactive', 'Inactivo')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>
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
