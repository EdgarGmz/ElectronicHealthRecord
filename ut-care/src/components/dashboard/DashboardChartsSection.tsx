import { useState, useEffect, useCallback } from 'react'
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Treemap,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'
import { getDashboardChartData } from '@/services/dashboard-charts.service'
import type { DashboardChartData, PeriodType } from '@/types/dashboard-charts'
import { GlassCard } from '@/components/atoms/GlassCard'

// Paleta por servicio:
// - Psicología: lila
// - Enfermería: rosa
const COLORS = {
  psychology: '#8b5cf6', // lila
  nursing: '#ec4899', // rosa
}
const PIE_COLORS = [COLORS.psychology, COLORS.nursing]

function getDefaultRange(periodType: PeriodType): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  if (periodType === 'day') {
    start.setDate(start.getDate() - 14)
  } else if (periodType === 'month') {
    start.setMonth(start.getMonth() - 6)
  } else {
    start.setFullYear(start.getFullYear() - 2)
  }
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export function DashboardChartsSection() {
  const { t } = useTranslation()
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [startDate, setStartDate] = useState(() => getDefaultRange('month').start)
  const [endDate, setEndDate] = useState(() => getDefaultRange('month').end)
  const [trendVariant, setTrendVariant] = useState<'line' | 'area'>('line')
  const [partVariant, setPartVariant] = useState<'pie' | 'donut' | 'treemap'>('pie')
  const [data, setData] = useState<DashboardChartData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getDashboardChartData({
      periodType,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    })
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [periodType, startDate, endDate])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !data) {
    return (
      <GlassCard>
        <p className="text-[var(--text-secondary)]">{t('dashboard.charts.loading')}</p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          {t('dashboard.charts.sectionTitle')}
        </h2>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">{t('dashboard.charts.filterBy')}</label>
            <select
              value={periodType}
              onChange={(e) => {
                const p = e.target.value as PeriodType
                setPeriodType(p)
                const r = getDefaultRange(p)
                setStartDate(r.start)
                setEndDate(r.end)
              }}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-3 py-2"
            >
              <option value="day">{t('dashboard.charts.day')}</option>
              <option value="month">{t('dashboard.charts.month')}</option>
              <option value="year">{t('dashboard.charts.year')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-[var(--color-primary)] text-white px-4 py-2 hover:opacity-90"
          >
            {t('dashboard.charts.apply')}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      </GlassCard>

      {data && (
        <>
          {/* Bar chart */}
          <GlassCard>
            <h3 className="text-md font-medium text-[var(--text-primary)] mb-3">{t('dashboard.charts.barTitle')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byPeriod} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend />
                  <Bar dataKey="psychology" name={t('dashboard.charts.psychology')} fill={COLORS.psychology} />
                  <Bar dataKey="nursing" name={t('dashboard.charts.nursing')} fill={COLORS.nursing} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Trend: Line or Area */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-[var(--text-primary)]">{t('dashboard.charts.trendTitle')}</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTrendVariant('line')}
                  className={`px-3 py-1 rounded text-sm ${trendVariant === 'line' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
                >
                  {t('dashboard.charts.trendLine')}
                </button>
                <button
                  type="button"
                  onClick={() => setTrendVariant('area')}
                  className={`px-3 py-1 rounded text-sm ${trendVariant === 'area' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
                >
                  {t('dashboard.charts.trendArea')}
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {trendVariant === 'line' ? (
                  <LineChart data={data.byPeriod} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="psychology" name={t('dashboard.charts.psychology')} stroke={COLORS.psychology} strokeWidth={2} />
                    <Line type="monotone" dataKey="nursing" name={t('dashboard.charts.nursing')} stroke={COLORS.nursing} strokeWidth={2} />
                  </LineChart>
                ) : (
                  <AreaChart data={data.byPeriod} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="psychology" name={t('dashboard.charts.psychology')} fill={COLORS.psychology} stroke={COLORS.psychology} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="nursing" name={t('dashboard.charts.nursing')} fill={COLORS.nursing} stroke={COLORS.nursing} fillOpacity={0.6} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Part-to-whole: Pie / Donut / Treemap */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-[var(--text-primary)]">{t('dashboard.charts.partToWholeTitle')}</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPartVariant('pie')}
                  className={`px-3 py-1 rounded text-sm ${partVariant === 'pie' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
                >
                  {t('dashboard.charts.pie')}
                </button>
                <button
                  type="button"
                  onClick={() => setPartVariant('donut')}
                  className={`px-3 py-1 rounded text-sm ${partVariant === 'donut' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
                >
                  {t('dashboard.charts.donut')}
                </button>
                <button
                  type="button"
                  onClick={() => setPartVariant('treemap')}
                  className={`px-3 py-1 rounded text-sm ${partVariant === 'treemap' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
                >
                  {t('dashboard.charts.treemap')}
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {partVariant === 'treemap' ? (
                  <Treemap
                    data={data.byService.map((s) => ({
                      name: s.service === 'psychology' ? t('dashboard.charts.psychology') : t('dashboard.charts.nursing'),
                      size: s.count,
                    }))}
                    dataKey="size"
                    stroke="var(--border)"
                  />
                ) : (
                  <PieChart>
                    <Pie
                      data={data.byService.map((s) => ({
                        name: s.service === 'psychology' ? t('dashboard.charts.psychology') : t('dashboard.charts.nursing'),
                        value: s.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={partVariant === 'donut' ? 60 : 0}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {data.byService.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Scatter */}
          <GlassCard>
            <h3 className="text-md font-medium text-[var(--text-primary)] mb-3">{t('dashboard.charts.scatterTitle')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid stroke="var(--border)" />
                  <XAxis dataKey="psychology" name={t('dashboard.charts.psychology')} stroke="var(--text-secondary)" />
                  <YAxis dataKey="nursing" name={t('dashboard.charts.nursing')} stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    cursor={{ stroke: 'var(--border)' }}
                  />
                  <Scatter name={t('dashboard.charts.psychology')} data={data.scatter} fill={COLORS.psychology} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Histogram: two bars side by side */}
          <GlassCard>
            <h3 className="text-md font-medium text-[var(--text-primary)] mb-3">{t('dashboard.charts.histogramTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <p className="text-sm text-[var(--text-secondary)] mb-1">{t('dashboard.charts.histogramPsychology')}</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.histogramPsychology} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="bucket" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                    <Bar dataKey="count" fill={COLORS.psychology} name={t('dashboard.charts.psychology')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64">
                <p className="text-sm text-[var(--text-secondary)] mb-1">{t('dashboard.charts.histogramNursing')}</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.histogramNursing} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="bucket" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                    <Bar dataKey="count" fill={COLORS.nursing} name={t('dashboard.charts.nursing')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>

          {/* Radar */}
          <GlassCard>
            <h3 className="text-md font-medium text-[var(--text-primary)] mb-3">{t('dashboard.charts.radarTitle')}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.radar} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <Radar name={t('dashboard.charts.psychology')} dataKey="psychology" stroke={COLORS.psychology} fill={COLORS.psychology} fillOpacity={0.5} />
                  <Radar name={t('dashboard.charts.nursing')} dataKey="nursing" stroke={COLORS.nursing} fill={COLORS.nursing} fillOpacity={0.5} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Heatmap: day of week */}
          <GlassCard>
            <h3 className="text-md font-medium text-[var(--text-primary)] mb-3">{t('dashboard.charts.heatmapTitle')}</h3>
            <div className="h-64 overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%" minWidth={400}>
                <BarChart
                  data={data.heatmap}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 48, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis type="category" dataKey="dayName" width={44} stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                  <Legend />
                  <Bar dataKey="psychology" name={t('dashboard.charts.psychology')} fill={COLORS.psychology} stackId="a" />
                  <Bar dataKey="nursing" name={t('dashboard.charts.nursing')} fill={COLORS.nursing} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Timeline (duración de sesiones/consultas, estilo Gantt) */}
          <GlassCard>
            <h3 className="text-md font-medium text-[var(--text-primary)] mb-3">{t('dashboard.charts.timelineTitle')}</h3>
            <div className="h-96 overflow-auto">
              <ResponsiveContainer width="100%" height="100%" minWidth={400}>
                <BarChart
                  data={data.timeline.slice(0, 30).map((d) => ({
                    name: d.name,
                    duration: Math.round((new Date(d.end).getTime() - new Date(d.start).getTime()) / 60000),
                    type: d.type,
                    start: d.start,
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 100, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" unit=" min" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis type="category" dataKey="name" width={96} stroke="var(--text-secondary)" fontSize={10} tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    formatter={(value: unknown, _name: unknown, props: { payload?: { start?: string; type?: string } }) => {
                      const v = Number(value)
                      const p = props?.payload
                      const start = p?.start ? new Date(p.start).toLocaleString() : ''
                      const service = p?.type === 'psychology' ? t('dashboard.charts.psychology') : t('dashboard.charts.nursing')
                      return [`${v} min. Inicio: ${start}`, service]
                    }}
                  />
                  <Bar dataKey="duration" name="Duración" radius={[0, 4, 4, 0]}>
                    {data.timeline.slice(0, 30).map((d, i) => (
                      <Cell key={i} fill={d.type === 'psychology' ? COLORS.psychology : COLORS.nursing} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  )
}
