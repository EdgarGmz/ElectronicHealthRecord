import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import {
  AlertTriangle,
  Calendar,
  Phone,
  Clock,
  TrendingDown,
  Users,
  Heart,
  Loader2,
  ShieldAlert,
  MessageSquareWarning,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Activity,
  ClipboardList,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getCoordinatorPsychologyDashboard } from '@/services/coordinator-psychology-dashboard.service'
import { getInterconsultations } from '@/services/interconsultation.service'
import type { CoordinatorPsychologyDashboardData } from '@/types/coordinator-psychology-dashboard'
import { getMoods } from '@/services/mood.service'
import type { Mood } from '@/types/mood'
import type { Interconsultation } from '@/types/interconsultation'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TAG_COLORS: Record<string, string> = {
  first: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30',
  follow_up: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/30',
  discharge_soon: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30',
}

const RISK_COLORS: Record<string, string> = {
  Alto: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-400/40',
  Medio: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40',
  Bajo: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40',
}

const URGENCY_COLORS: Record<string, string> = {
  Urgente: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-400/40',
  Alta: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-400/40',
  Media: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40',
  Baja: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40',
}

const DIAGNOSIS_PALETTE = ['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6', '#10b981']

const MOOD_CATEGORY_COLORS: Record<string, string> = {
  very_common: '#64748b', // slate
  positive: '#10b981', // emerald
  common: '#0ea5e9', // cyan
  social_load: '#f97316', // orange
  disorientation: '#6366f1', // indigo
  less_common: '#a855f7', // purple
  high_intensity: '#ef4444', // red
  rare: '#e11d48', // rose
  others: '#6b7280', // gray
}

interface KpiCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  accentClass: string
  to?: string
}

function KpiCard({ label, value, icon, accentClass, to }: KpiCardProps) {
  const inner = (
    <div className={`glass-card p-5 flex items-center gap-4 border-l-4 ${accentClass} hover:shadow-lg transition-shadow`}>
      <div className="flex-shrink-0 p-3 rounded-xl bg-[var(--bg-secondary)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
      </div>
      {to && <ArrowRight size={16} className="ml-auto flex-shrink-0 text-[var(--text-muted)]" />}
    </div>
  )
  return to ? <Link to={to} className="block">{inner}</Link> : inner
}

export function DashboardCoordinatorPsychology() {
  const { t } = useTranslation()
  const [data, setData] = useState<CoordinatorPsychologyDashboardData | null>(null)
  const [interconsultations, setInterconsultations] = useState<Interconsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moods, setMoods] = useState<Mood[]>([])

  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const firstName = user?.firstName ?? 'Coordinador'
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError(t('common.error'))
      return
    }
    Promise.all([
      getCoordinatorPsychologyDashboard(token),
      getInterconsultations({ status: 'Pendiente', toDepartment: 'Psicología', limit: 5 }),
      getMoods().catch(() => []),
    ])
      .then(([dashData, icData, moodsData]) => {
        setData(dashData)
        setInterconsultations(icData.interconsultations)
        setMoods(moodsData)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t, token])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-[var(--text-muted)]">Cargando panel de coordinación…</p>
      </div>
    )
  }
  if (error || !data) {
    return (
      <GlassCard>
        <p className="text-[var(--color-error)]">{error || t('common.error')}</p>
      </GlassCard>
    )
  }

  const hasRisk = data.riskAlerts.length > 0
  const hasToConfirm = data.appointmentsToConfirm.length > 0
  const pendingInterconsultations = interconsultations.length

  // Chart data: top diagnoses donut
  const diagnosisData = data.clinicalMetrics.topDiagnoses.map((d) => ({
    name: d.diagnosis,
    value: d.count,
    percent: d.percent,
  }))

  // Chart data: workload horizontal bar
  const workloadData = data.workload.map((w) => ({
    name: w.professionalName.split(' ').slice(0, 2).join(' '),
    horas: w.hoursThisWeek,
    overRecommended: w.overRecommended,
  }))

  // Chart data: scales progress as simple horizontal bars
  const scalesData = data.clinicalMetrics.averageProgressScales.map((s) => ({
    name: s.scale,
    cambio: s.averageChange,
    n: s.sampleSize,
  }))

  // Chart data: mood distribution (top 10 + others), resolved to names + emojis
  const moodByCode = new Map(moods.map((m) => [m.code, m]))
  const moodData = data.clinicalMetrics.moodDistribution.map((m) => {
    if (m.mood === 'others') {
      return {
        code: m.mood,
        name: t('dashboard.coordinator.moodOthers'),
        emoji: '⋯',
        color: MOOD_CATEGORY_COLORS.others,
        value: m.count,
        percent: m.percent,
      }
    }
    const mood = moodByCode.get(m.mood)
    return {
      code: m.mood,
      name: mood?.name ?? m.mood,
      emoji: mood?.emoji ?? '•',
      color: MOOD_CATEGORY_COLORS[mood?.category ?? ''] ?? DIAGNOSIS_PALETTE[0],
      value: m.count,
      percent: m.percent,
    }
  })

  const completedToday = data.agendaToday.filter((a) => a.status === 'Completada').length
  const completionPct = data.agendaToday.length > 0
    ? Math.round((completedToday / data.agendaToday.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* ─── HERO GREETING ─── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Bienvenido, {firstName} 👋
          </h1>
          <p className="text-sm text-[var(--text-muted)] capitalize mt-0.5">{today}</p>
        </div>
        <Link
          to="/interconsultations"
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
        >
          <ClipboardList size={16} />
          Ver interconsultas
        </Link>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Pacientes en riesgo"
          value={data.riskAlerts.length}
          icon={<ShieldAlert size={22} className="text-red-500" />}
          accentClass={hasRisk ? 'border-l-red-500' : 'border-l-emerald-500'}
        />
        <KpiCard
          label="Citas hoy"
          value={data.agendaToday.length}
          icon={<Calendar size={22} className="text-[var(--color-primary)]" />}
          accentClass="border-l-[var(--color-primary)]"
          to="/appointments"
        />
        <KpiCard
          label="Por confirmar"
          value={data.appointmentsToConfirm.length}
          icon={<Clock size={22} className={hasToConfirm ? 'text-amber-500' : 'text-[var(--text-muted)]'} />}
          accentClass={hasToConfirm ? 'border-l-amber-500' : 'border-l-[var(--border)]'}
        />
        <KpiCard
          label="Interconsultas pendientes"
          value={pendingInterconsultations}
          icon={<MessageSquareWarning size={22} className={pendingInterconsultations > 0 ? 'text-orange-500' : 'text-[var(--text-muted)]'} />}
          accentClass={pendingInterconsultations > 0 ? 'border-l-orange-500' : 'border-l-[var(--border)]'}
          to="/interconsultations"
        />
      </div>

      {/* ─── PUNTOS CRÍTICOS (Alertas de riesgo + Seguimiento) ─── */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <AlertTriangle className="text-[var(--color-warning)]" size={20} />
          {t('dashboard.coordinator.urgencyTrafficLight')}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Riesgo suicida */}
          <GlassCard className={hasRisk ? 'border-l-4 border-l-red-500' : ''}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <ShieldAlert size={16} className={hasRisk ? 'text-red-500' : 'text-emerald-500'} />
                {t('dashboard.coordinator.riskAlerts')}
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${hasRisk ? 'bg-red-500/20 text-red-700 dark:text-red-300' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'}`}>
                {data.riskAlerts.length}
              </span>
            </div>
            {data.riskAlerts.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} />
                {t('dashboard.coordinator.noRiskAlerts')}
              </div>
            ) : (
              <ul className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {data.riskAlerts.map((a) => (
                  <li key={a.patientId} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 shrink-0 text-xs px-2 py-0.5 rounded font-medium ${RISK_COLORS[a.suicideRiskLevel] ?? RISK_COLORS['Medio']}`}>
                      {a.suicideRiskLevel}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/patients/${a.patientId}`}
                        className="text-[var(--color-primary)] hover:underline font-medium"
                      >
                        {a.patientName}
                      </Link>
                      {a.lastSessionDate && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Última sesión: {a.lastSessionDate}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          {/* Crisis follow-up */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Phone size={16} className="text-[var(--color-primary)]" />
                {t('dashboard.coordinator.crisisFollowUp')}
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                {data.crisisFollowUp.length}
              </span>
            </div>
            {data.crisisFollowUp.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} />
                {t('dashboard.coordinator.noCrisisFollowUp')}
              </div>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {data.crisisFollowUp.map((a) => (
                  <li key={a.patientId} className="flex items-center gap-2 text-sm py-1 border-b border-[var(--border)] last:border-0">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] shrink-0" />
                    <Link
                      to={`/patients/${a.patientId}`}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {a.patientName}
                    </Link>
                    {a.lastSessionDate && (
                      <span className="text-xs text-[var(--text-muted)] ml-auto">
                        {a.lastSessionDate}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </section>

      {/* ─── AGENDA DEL DÍA ─── */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Calendar size={20} className="text-[var(--color-primary)]" />
          {t('dashboard.coordinator.agendaToday')}
          {data.agendaToday.length > 0 && (
            <span className="ml-auto text-xs text-[var(--text-muted)] font-normal flex items-center gap-1">
              <Activity size={14} />
              {completionPct}% completadas
            </span>
          )}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {t('dashboard.coordinator.todaysAppointments')}
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                {data.agendaToday.length} citas
              </span>
            </div>
            {data.agendaToday.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinator.noAppointmentsToday')}</p>
            ) : (
              <>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
                <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {data.agendaToday.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center gap-2 text-sm py-1.5 border-b border-[var(--border)] last:border-0"
                    >
                      <Clock size={13} className="text-[var(--text-muted)] shrink-0" />
                      <span className="font-mono font-medium text-[var(--text-primary)] text-xs">
                        {formatTime(a.scheduledDate)}
                      </span>
                      <span className="text-[var(--text-secondary)] truncate">{a.patientName}</span>
                      <span className="text-[var(--text-muted)] text-xs hidden sm:block">· {a.professionalName}</span>
                      {a.tag && (
                        <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md font-medium ${TAG_COLORS[a.tag] || ''}`}>
                          {t(`dashboard.coordinator.tag.${a.tag}`)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </GlassCard>

          <GlassCard className={hasToConfirm ? 'border-l-4 border-l-amber-500' : ''}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {t('dashboard.coordinator.appointmentsToConfirm')}
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${hasToConfirm ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'}`}>
                {data.appointmentsToConfirm.length}
              </span>
            </div>
            {data.appointmentsToConfirm.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} />
                {t('dashboard.coordinator.allConfirmed')}
              </div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {data.appointmentsToConfirm.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm py-1.5 border-b border-[var(--border)] last:border-0">
                    <Clock size={13} className="text-amber-500 shrink-0" />
                    <span className="font-mono text-xs font-medium text-[var(--text-primary)]">
                      {formatTime(a.scheduledDate)}
                    </span>
                    <span className="text-[var(--text-secondary)] truncate">{a.patientName}</span>
                    <span className="text-[var(--text-muted)] text-xs ml-auto hidden sm:block">
                      {a.professionalName}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </section>

      {/* ─── GRÁFICAS CLÍNICAS ─── */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Activity size={20} className="text-[var(--color-primary)]" />
          {t('dashboard.coordinator.clinicalVisualizations')}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Diagnósticos prevalentes — Donut */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
              <Stethoscope size={16} className="text-[var(--color-primary)]" />
              {t('dashboard.coordinator.topDiagnoses')}
            </h3>
            {diagnosisData.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] mt-4">{t('dashboard.coordinator.noDiagnoses')}</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diagnosisData}
                      cx="40%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {diagnosisData.map((_, i) => (
                        <Cell key={i} fill={DIAGNOSIS_PALETTE[i % DIAGNOSIS_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      formatter={(value: unknown, _n: unknown, props: { payload?: { name?: string; percent?: number } }) => {
                        const n = typeof value === 'number' ? value : Number(value ?? 0)
                        const safe = Number.isFinite(n) ? n : 0
                        return [`${safe} casos (${props?.payload?.percent ?? 0}%)`, props?.payload?.name ?? '']
                      }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          {/* Estado de ánimo en sesiones — Donut */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
              <Heart size={16} className="text-[var(--color-primary)]" />
              {t('dashboard.coordinator.moodDistribution')}
            </h3>
            {moodData.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] mt-4">
                {t('dashboard.coordinator.noMoodData')}
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="40%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {moodData.map((item, i) => (
                        <Cell key={i} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      formatter={(value: unknown, _n: unknown, props: { payload?: { name?: string; percent?: number; emoji?: string } }) => {
                        const label = props?.payload?.name ?? ''
                        const emoji = props?.payload?.emoji ?? ''
                        const n = typeof value === 'number' ? value : Number(value ?? 0)
                        const safe = Number.isFinite(n) ? n : 0
                        return [
                          `${safe} sesiones (${props?.payload?.percent ?? 0}%)`,
                          `${emoji ? `${emoji} ` : ''}${label}`,
                        ]
                      }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value, _entry, index) => {
                        const item = moodData[index]
                        const emoji = item?.emoji ?? ''
                        return (
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {emoji ? `${emoji} ${value}` : value}
                          </span>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          {/* Carga de terapeutas — Barra horizontal */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
              <Users size={16} className="text-[var(--color-primary)]" />
              {t('dashboard.coordinator.workload')}
            </h3>
            {workloadData.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] mt-4">{t('dashboard.coordinator.noWorkloadData')}</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workloadData}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      unit=" h"
                      stroke="var(--text-secondary)"
                      fontSize={11}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      stroke="var(--text-secondary)"
                      fontSize={11}
                      tick={{ fill: 'var(--text-secondary)' }}
                    />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      formatter={(value: unknown) => {
                        const n = typeof value === 'number' ? value : Number(value ?? 0)
                        const safe = Number.isFinite(n) ? n : 0
                        return [`${safe} horas`, 'Carga semanal']
                      }}
                    />
                    <Bar dataKey="horas" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {workloadData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.overRecommended ? '#f59e0b' : '#8b5cf6'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {workloadData.some((w) => w.overRecommended) && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                Amarillo = carga sobre el límite recomendado
              </p>
            )}
          </GlassCard>

          {/* Progreso de escalas — Barras */}
          {scalesData.length > 0 && (
            <GlassCard>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                <TrendingDown size={16} className="text-emerald-500" />
                {t('dashboard.coordinator.averageProgress')}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Cambio promedio en escalas psicométricas (negativo = mejoría)
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scalesData}
                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      formatter={(value: unknown, _n: unknown, props: { payload?: { n?: number } }) => {
                        const n = typeof value === 'number' ? value : Number(value ?? 0)
                        const safe = Number.isFinite(n) ? n : 0
                        return [
                        `${safe > 0 ? '+' : ''}${safe} (n=${props?.payload?.n ?? 0})`,
                        'Cambio promedio',
                        ]
                      }}
                    />
                    <Bar dataKey="cambio" radius={[4, 4, 0, 0]} maxBarSize={48}>
                      {scalesData.map((entry, i) => (
                        <Cell key={i} fill={entry.cambio < 0 ? '#10b981' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* Tasa de deserción */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
              <TrendingDown size={16} />
              {t('dashboard.coordinator.churnRate')}
            </h3>
            <div className="flex items-end gap-3 mt-2">
              <p className="text-4xl font-bold text-[var(--text-primary)]">
                {data.clinicalMetrics.churnRatePercent}%
              </p>
              <span className={`mb-1 text-sm font-medium ${data.clinicalMetrics.churnRatePercent > 30 ? 'text-red-500' : data.clinicalMetrics.churnRatePercent > 15 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {data.clinicalMetrics.churnRatePercent > 30 ? '⚠ Alto' : data.clinicalMetrics.churnRatePercent > 15 ? '◑ Moderado' : '✓ Bajo'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {data.clinicalMetrics.churnNumerator} de {data.clinicalMetrics.churnDenominator} {t('dashboard.coordinator.patientsOneSession')}
            </p>
            {/* Mini visual bar */}
            <div className="mt-4 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${data.clinicalMetrics.churnRatePercent > 30 ? 'bg-red-500' : data.clinicalMetrics.churnRatePercent > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(data.clinicalMetrics.churnRatePercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ─── INTERCONSULTAS PENDIENTES ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <ClipboardList size={20} className="text-[var(--color-primary)]" />
            Interconsultas pendientes — Psicología
          </h2>
          <Link
            to="/interconsultations"
            className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            Ver todas <ArrowRight size={13} />
          </Link>
        </div>
        <GlassCard>
          {interconsultations.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 py-2">
              <CheckCircle2 size={16} />
              No hay interconsultas pendientes hacia Psicología.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {interconsultations.map((ic) => (
                <li key={ic.id} className="py-3 flex flex-wrap items-start gap-3">
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${URGENCY_COLORS[ic.urgency] ?? ''}`}>
                    {ic.urgency}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {ic.patient?.user.firstName} {ic.patient?.user.lastName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{ic.reason}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(ic.createdAt)}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      De: {ic.fromDepartment}
                    </p>
                  </div>
                  <Link
                    to={`/interconsultations/${ic.id}`}
                    className="shrink-0 self-center text-xs px-2.5 py-1 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  >
                    Responder
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </section>

      {/* ─── RINCÓN DEL TERAPEUTA ─── */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Heart size={20} className="text-[var(--color-primary)]" />
          {t('dashboard.coordinator.therapistCorner')}
        </h2>
        <GlassCard className="bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-purple-500/5">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                {t('dashboard.coordinator.groundingPhrase')}
              </p>
              <p className="text-base italic text-[var(--text-secondary)] leading-relaxed">
                "{data.groundingPhrase}"
              </p>
            </div>
            <div className="sm:border-l sm:border-[var(--border)] sm:pl-6 min-w-fit">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Resumen del día</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  <span className="text-[var(--text-secondary)]">{data.agendaToday.length} citas programadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[var(--text-secondary)]">{data.appointmentsToConfirm.length} por confirmar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[var(--text-secondary)]">{data.riskAlerts.length} alertas activas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-[var(--text-secondary)]">{pendingInterconsultations} interconsultas pendientes</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
