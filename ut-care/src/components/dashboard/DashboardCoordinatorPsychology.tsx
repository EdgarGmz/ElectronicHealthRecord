import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import {
  AlertTriangle,
  Calendar,
  Phone,
  Clock,
  BarChart3,
  TrendingDown,
  Stethoscope,
  Users,
  Heart,
  Loader2,
} from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getCoordinatorPsychologyDashboard } from '@/services/coordinator-psychology-dashboard.service'
import type { CoordinatorPsychologyDashboardData } from '@/types/coordinator-psychology-dashboard'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const TAG_COLORS: Record<string, string> = {
  first: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  follow_up: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  discharge_soon: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
}

export function DashboardCoordinatorPsychology() {
  const { t } = useTranslation()
  const [data, setData] = useState<CoordinatorPsychologyDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError(t('common.error'))
      return
    }
    getCoordinatorPsychologyDashboard(token)
      .then(setData)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t, token])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
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

  return (
    <div className="space-y-6">
      {/* 1. Semáforo de urgencias */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <AlertTriangle className="text-[var(--color-warning)]" size={22} />
          {t('dashboard.coordinator.urgencyTrafficLight')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className={hasRisk ? 'border-l-4 border-l-[var(--color-error)]' : ''}>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('dashboard.coordinator.riskAlerts')}
            </h3>
            {data.riskAlerts.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinator.noRiskAlerts')}</p>
            ) : (
              <ul className="space-y-2">
                {data.riskAlerts.map((a) => (
                  <li key={a.patientId} className="text-sm">
                    <Link
                      to={`/patients/${a.patientId}`}
                      className="text-[var(--color-primary)] hover:underline font-medium"
                    >
                      {a.patientName}
                    </Link>
                    <span className="text-[var(--text-secondary)] ml-1">
                      — {a.suicideRiskLevel}
                      {a.lastSessionDate && ` · ${t('dashboard.coordinator.lastSession')}: ${a.lastSessionDate}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
          <GlassCard>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-1">
              <Phone size={16} />
              {t('dashboard.coordinator.crisisFollowUp')}
            </h3>
            {data.crisisFollowUp.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinator.noCrisisFollowUp')}</p>
            ) : (
              <ul className="space-y-2">
                {data.crisisFollowUp.slice(0, 5).map((a) => (
                  <li key={a.patientId} className="text-sm">
                    <Link
                      to={`/patients/${a.patientId}`}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {a.patientName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </section>

      {/* 2. Vista operativa del día */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Calendar size={22} className="text-[var(--color-primary)]" />
          {t('dashboard.coordinator.agendaToday')}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              {t('dashboard.coordinator.todaysAppointments')}
            </h3>
            {data.agendaToday.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinator.noAppointmentsToday')}</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {data.agendaToday.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center gap-2 text-sm py-1.5 border-b border-[var(--border)] last:border-0"
                  >
                    <Clock size={14} className="text-[var(--text-muted)] shrink-0" />
                    <span className="font-medium text-[var(--text-primary)]">{formatTime(a.scheduledDate)}</span>
                    <span className="text-[var(--text-secondary)]">{a.patientName}</span>
                    <span className="text-[var(--text-muted)]">· {a.professionalName}</span>
                    {a.tag && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${TAG_COLORS[a.tag] || ''}`}>
                        {t(`dashboard.coordinator.tag.${a.tag}`)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
          <GlassCard className={hasToConfirm ? 'border-l-4 border-l-amber-500' : ''}>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              {t('dashboard.coordinator.appointmentsToConfirm')} ({data.appointmentsToConfirm.length})
            </h3>
            {data.appointmentsToConfirm.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinator.allConfirmed')}</p>
            ) : (
              <ul className="space-y-2">
                {data.appointmentsToConfirm.map((a) => (
                  <li key={a.id} className="text-sm">
                    <span className="text-[var(--text-primary)]">{formatTime(a.scheduledDate)}</span>
                    <span className="text-[var(--text-secondary)] ml-2">{a.patientName}</span>
                    <span className="text-[var(--text-muted)] ml-1">· {a.professionalName}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </section>

      {/* 3. Indicadores de salud clínica */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <BarChart3 size={22} className="text-[var(--color-primary)]" />
          {t('dashboard.coordinator.clinicalMetrics')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassCard>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <TrendingDown size={16} />
              {t('dashboard.coordinator.churnRate')}
            </h3>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{data.clinicalMetrics.churnRatePercent}%</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {data.clinicalMetrics.churnNumerator} / {data.clinicalMetrics.churnDenominator}{' '}
              {t('dashboard.coordinator.patientsOneSession')}
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1">
              <Stethoscope size={16} />
              {t('dashboard.coordinator.averageProgress')}
            </h3>
            {data.clinicalMetrics.averageProgressScales.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinator.noScaleData')}</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {data.clinicalMetrics.averageProgressScales.map((s) => (
                  <li key={s.scale}>
                    <span className="text-[var(--text-primary)]">{s.scale}</span>
                    <span className={s.averageChange < 0 ? 'text-emerald-600' : 'text-[var(--text-secondary)]'}>
                      {' '}
                      {s.averageChange > 0 ? '+' : ''}{s.averageChange} (n={s.sampleSize})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
          <GlassCard>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1">
              <Users size={16} />
              {t('dashboard.coordinator.topDiagnoses')}
            </h3>
            {data.clinicalMetrics.topDiagnoses.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinator.noDiagnoses')}</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {data.clinicalMetrics.topDiagnoses.map((d, i) => (
                  <li key={i}>
                    <span className="text-[var(--text-primary)]">{d.diagnosis}</span>
                    <span className="text-[var(--text-muted)]"> {d.percent}%</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </section>

      {/* 4. Rincón del terapeuta */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Heart size={22} className="text-[var(--color-primary)]" />
          {t('dashboard.coordinator.therapistCorner')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('dashboard.coordinator.workload')}
            </h3>
            {data.workload.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('dashboard.coordinator.noWorkloadData')}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.workload.map((w) => (
                  <li
                    key={w.professionalId}
                    className={`flex justify-between ${w.overRecommended ? 'text-[var(--color-warning)]' : 'text-[var(--text-primary)]'}`}
                  >
                    <span>{w.professionalName}</span>
                    <span>
                      {w.hoursThisWeek} h {w.overRecommended && '⚠️'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
          <GlassCard className="bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('dashboard.coordinator.groundingPhrase')}
            </h3>
            <p className="text-sm italic text-[var(--text-secondary)] leading-relaxed">
              "{data.groundingPhrase}"
            </p>
          </GlassCard>
        </div>
      </section>
    </div>
  )
}
