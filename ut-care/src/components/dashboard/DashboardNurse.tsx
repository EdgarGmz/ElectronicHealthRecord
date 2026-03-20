import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Users,
  Stethoscope,
  Pill,
  ArrowRight,
  Activity,
  Loader2,
  ClipboardList,
  Layers,
  GraduationCap,
  Briefcase,
  Users2,
  User,
  User2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useAuthStore } from '@/store/auth.store'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getPatients } from '@/services/patient.service'
import { getNursingProcedures } from '@/services/nursing-procedure.service'
import { getMedications } from '@/services/medication.service'
import { getDashboardChartData } from '@/services/dashboard-charts.service'
import { getNursingKpis } from '@/services/dashboard-nursing-kpis.service'
import { getNursingPatientsSeries } from '@/services/dashboard-nursing-patients-series.service'
import { getCareers } from '@/services/career.service'
import type { Career } from '@/types/career'
import type { PeriodType } from '@/types/dashboard-charts'

const NURSING_COLOR = '#059669' // línea principal / hombres
const NURSING_COLOR_LIGHT = '#3b82f6' // mujeres
// Paleta para varias líneas por carrera (colores distintos)
const CAREER_PALETTE = [
  '#059669', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#dc2626', // red
  '#ea580c', // orange
  '#ca8a04', // yellow
  '#0891b2', // cyan
  '#db2777', // pink
]

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

export function DashboardNurse() {
  const { t } = useTranslation()
  const [totalPatients, setTotalPatients] = useState<number | null>(null)
  const [totalProcedures, setTotalProcedures] = useState<number | null>(null)
  const [totalMedications, setTotalMedications] = useState<number | null>(null)
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof getNursingKpis>> | null>(null)
  const [kpiScope, setKpiScope] = useState<'day' | 'week' | 'year'>('day')
  const [chartData, setChartData] = useState<Awaited<ReturnType<typeof getDashboardChartData>> | null>(null)
  const [chartPeriod, setChartPeriod] = useState<PeriodType>('month')
  const [seriesPeriod, setSeriesPeriod] = useState<PeriodType>('month')
  const [careers, setCareers] = useState<Career[]>([])
  const [segmentMode, setSegmentMode] = useState<'career' | 'sex'>('career')
  const [careerSelections, setCareerSelections] = useState<string[]>(['all']) // ['all'] | ['general', id, ...]
  const [sexSelections, setSexSelections] = useState<Array<'all' | 'male' | 'female'>>(['all'])
  const [patientsSeries, setPatientsSeries] = useState<{ period: string; [key: string]: string | number | undefined }[]>([])
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

  const { startDate: seriesStart, endDate: seriesEnd } = useMemo(
    () => (seriesPeriod === 'year' ? getDateRange('year', 4) : seriesPeriod === 'month' ? getDateRange('month', 11) : getDateRange('day', 30)),
    [seriesPeriod]
  )

  useEffect(() => {
    getCareers().then(setCareers).catch(() => setCareers([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      getPatients({ page: 1, limit: 1 }).then((r) => r.pagination.total),
      getNursingProcedures({ page: 1, limit: 1 }).then((r) => r.pagination.total),
      getMedications({ page: 1, limit: 1 }).then((r) => r.pagination.total),
      getNursingKpis().catch(() => null),
      getDashboardChartData({
        periodType: chartPeriod,
        startDate: chartStart,
        endDate: chartEnd,
      }).catch(() => null),
    ])
      .then(([patients, procedures, medications, kpiData, charts]) => {
        if (cancelled) return
        setTotalPatients(patients)
        setTotalProcedures(procedures)
        setTotalMedications(medications)
        setKpis(kpiData)
        setChartData(charts)
      })
      .catch(() => {
        if (!cancelled) setError(t('common.error'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [t, chartStart, chartEnd, chartPeriod])

  useEffect(() => {
    if (segmentMode === 'career') {
      const sel = careerSelections.filter((s) => s !== 'all')
      const onlyAll = careerSelections.length === 1 && careerSelections[0] === 'all'

      if (onlyAll) {
        getNursingPatientsSeries({
          periodType: seriesPeriod,
          startDate: seriesStart,
          endDate: seriesEnd,
        })
          .then((series) =>
            setPatientsSeries(series.map((p) => ({ period: p.period, all: p.count })))
          )
          .catch(() => setPatientsSeries([]))
        return
      }

      if (sel.length === 0) {
        setPatientsSeries([])
        return
      }

      // Varias líneas: una petición por opción (general o careerId)
      Promise.all(
        sel.map((key) => {
          const params: Parameters<typeof getNursingPatientsSeries>[0] = {
            periodType: seriesPeriod,
            startDate: seriesStart,
            endDate: seriesEnd,
          }
          if (key === 'general') params.includeGeneral = true
          else params.careerId = key
          return getNursingPatientsSeries(params).then((series) => ({ key, series }))
        })
      )
        .then((results) => {
          const map = new Map<string, { period: string; [k: string]: string | number | undefined }>()
          for (const { key, series } of results) {
            for (const p of series) {
              const existing = map.get(p.period) || { period: p.period }
              map.set(p.period, { ...existing, [key]: p.count })
            }
          }
          const merged = Array.from(map.values()).sort((a, b) =>
            String(a.period).localeCompare(String(b.period))
          )
          setPatientsSeries(merged)
        })
        .catch(() => setPatientsSeries([]))
      return
    }

    // segmentMode === 'sex' → una línea (total) si 'all', o líneas por sexo
    const onlyAll = sexSelections.length === 1 && sexSelections[0] === 'all'
    if (onlyAll) {
      getNursingPatientsSeries({
        periodType: seriesPeriod,
        startDate: seriesStart,
        endDate: seriesEnd,
      })
        .then((series) =>
          setPatientsSeries(series.map((p) => ({ period: p.period, total: p.count })))
        )
        .catch(() => setPatientsSeries([]))
      return
    }

    const bySex = sexSelections.filter((s): s is 'male' | 'female' => s === 'male' || s === 'female')
    if (bySex.length === 0) {
      setPatientsSeries([])
      return
    }

    const promises = bySex.map((label) =>
      getNursingPatientsSeries({
        periodType: seriesPeriod,
        startDate: seriesStart,
        endDate: seriesEnd,
        sex: label,
      }).then((series) => ({ label, series }))
    )

    Promise.all(promises)
      .then((results) => {
        const map = new Map<string, { period: string; male?: number; female?: number }>()
        for (const { label, series } of results) {
          for (const p of series) {
            const existing = map.get(p.period) || { period: p.period }
            map.set(p.period, { ...existing, [label]: p.count })
          }
        }
        const merged = Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period))
        setPatientsSeries(merged)
      })
      .catch(() => setPatientsSeries([]))
  }, [segmentMode, careerSelections, sexSelections, seriesPeriod, seriesStart, seriesEnd])

  const careerLineKeys = useMemo(() => {
    if (segmentMode !== 'career') return []
    if (careerSelections.length === 1 && careerSelections[0] === 'all') return ['all']
    return careerSelections.filter((s) => s !== 'all')
  }, [segmentMode, careerSelections])

  const getCareerLabel = (key: string) => {
    if (key === 'all') return t('dashboard.nurse.allCareers')
    if (key === 'general') return t('dashboard.nurse.generalStaff')
    return careers.find((c) => c.id === key)?.name ?? key
  }

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
      {/* KPIs (sin citas) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label={t('dashboard.coordinatorNursing.totalPatients')}
          value={totalPatients ?? '—'}
          icon={<Users size={22} className="text-[var(--color-primary)]" />}
          to="/patients"
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

      {/* KPIs: pacientes atendidos + insumos consumidos (día/semana/año) */}
      <GlassCard className="rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {t('dashboard.nurse.kpisTitle')}
          </h2>
          <div className="flex items-center gap-2">
            {(['day', 'week', 'year'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setKpiScope(s)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                  kpiScope === s
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {t(`dashboard.nurse.scope.${s}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {t('dashboard.nurse.patientsAttended')}
            </p>
            <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
              {kpis ? String(kpis[kpiScope].patientsAttended) : '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {t('dashboard.nurse.suppliesConsumed')}
            </p>
            <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
              {kpis ? String(kpis[kpiScope].suppliesConsumed) : '—'}
            </p>
          </div>
        </div>
      </GlassCard>

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
              <Activity size={18} style={{ color: NURSING_COLOR }} />
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
        </div>
      </section>

      {/* Serie temporal: pacientes atendidos (filtros por carrera o sexo) */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Activity size={20} style={{ color: NURSING_COLOR }} />
          {t('dashboard.nurse.patientsSeriesTitle')}
        </h2>

        <GlassCard className="rounded-2xl transition-shadow hover:shadow-xl">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientsSeries} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'male'
                      ? t('dashboard.nurse.male')
                      : name === 'female'
                        ? t('dashboard.nurse.female')
                        : segmentMode === 'career'
                          ? getCareerLabel(name)
                          : t('dashboard.nurse.patientsAttended'),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                  iconSize={10}
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                />
                {segmentMode === 'career' ? (
                  careerLineKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CAREER_PALETTE[i % CAREER_PALETTE.length]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      name={getCareerLabel(key)}
                    />
                  ))
                ) : sexSelections.length === 1 && sexSelections[0] === 'all' ? (
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={NURSING_COLOR}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name={t('dashboard.nurse.patientsAttended')}
                  />
                ) : (
                  <>
                    {sexSelections.includes('male') && (
                      <Line
                        type="monotone"
                        dataKey="male"
                        stroke={NURSING_COLOR}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        name={t('dashboard.nurse.male')}
                      />
                    )}
                    {sexSelections.includes('female') && (
                      <Line
                        type="monotone"
                        dataKey="female"
                        stroke={NURSING_COLOR_LIGHT}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        name={t('dashboard.nurse.female')}
                      />
                    )}
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-[var(--text-secondary)]">{t('dashboard.nurse.period')}:</label>
              <select
                value={seriesPeriod}
                onChange={(e) => setSeriesPeriod(e.target.value as PeriodType)}
                className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              >
                <option value="day">{t('dashboard.nurse.periodDay')}</option>
                <option value="month">{t('dashboard.nurse.periodMonth')}</option>
                <option value="year">{t('dashboard.nurse.periodYear')}</option>
              </select>

              <label className="text-sm text-[var(--text-secondary)]">{t('dashboard.nurse.filterBy')}:</label>
              <select
                value={segmentMode}
                onChange={(e) => setSegmentMode(e.target.value as 'career' | 'sex')}
                className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              >
                <option value="career">{t('dashboard.nurse.filterCareer')}</option>
                <option value="sex">{t('dashboard.nurse.filterSex')}</option>
              </select>
            </div>

            {segmentMode === 'career' ? (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {t('dashboard.nurse.career')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCareerSelections(['all'])}
                    className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="group flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs sm:text-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5">
                    <input
                      type="checkbox"
                      checked={careerSelections.length === 1 && careerSelections[0] === 'all'}
                      onChange={(e) => setCareerSelections(e.target.checked ? ['all'] : [])}
                    />
                    <Layers size={14} className="text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                    {t('dashboard.nurse.allCareers')}
                  </label>
                  <label className="group flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs sm:text-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5">
                    <input
                      type="checkbox"
                      checked={careerSelections.includes('general')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCareerSelections((prev) => (prev.includes('all') ? ['general'] : [...prev.filter((x) => x !== 'all'), 'general']))
                        } else {
                          setCareerSelections((prev) => prev.filter((x) => x !== 'general'))
                        }
                      }}
                    />
                    <Users2 size={14} className="text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                    {t('dashboard.nurse.generalStaff')}
                  </label>
                  {careers.map((c) => (
                    <label
                      key={c.id}
                      className="group flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs sm:text-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                    >
                      <input
                        type="checkbox"
                        checked={careerSelections.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCareerSelections((prev) =>
                              prev.includes('all') ? [c.id] : [...prev.filter((x) => x !== 'all'), c.id]
                            )
                          } else {
                            setCareerSelections((prev) => prev.filter((x) => x !== c.id))
                          }
                        }}
                      />
                      <GraduationCap size={14} className="text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {t('dashboard.nurse.sex')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSexSelections(['all'])}
                    className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="group flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs sm:text-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5">
                    <input
                      type="checkbox"
                      checked={sexSelections.length === 1 && sexSelections[0] === 'all'}
                      onChange={(e) =>
                        setSexSelections(e.target.checked ? ['all'] : ['male', 'female'])
                      }
                    />
                    <Users size={14} className="text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                    {t('dashboard.nurse.allSex')}
                  </label>
                  <label className="group flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs sm:text-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5">
                    <input
                      type="checkbox"
                      checked={sexSelections.includes('male')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSexSelections((prev) =>
                            prev.length === 1 && prev[0] === 'all' ? ['male'] : prev.includes('male') ? prev : [...prev, 'male']
                          )
                        } else {
                          const next = sexSelections.filter((s) => s !== 'male')
                          setSexSelections(next.length > 0 ? next : ['all'])
                        }
                      }}
                    />
                    <User size={14} className="text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                    {t('dashboard.nurse.male')}
                  </label>
                  <label className="group flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-1.5 text-xs sm:text-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5">
                    <input
                      type="checkbox"
                      checked={sexSelections.includes('female')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSexSelections((prev) =>
                            prev.length === 1 && prev[0] === 'all' ? ['female'] : prev.includes('female') ? prev : [...prev, 'female']
                          )
                        } else {
                          const next = sexSelections.filter((s) => s !== 'female')
                          setSexSelections(next.length > 0 ? next : ['all'])
                        }
                      }}
                    />
                    <User2 size={14} className="text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                    {t('dashboard.nurse.female')}
                  </label>
                </div>
              </div>
            )}
          </div>
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

