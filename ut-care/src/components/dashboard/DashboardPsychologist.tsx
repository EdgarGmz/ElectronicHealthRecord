import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CalendarDays,
  Clock,
  MessageSquare,
  ArrowRight,
  Bell,
  Loader2,
  ClipboardList,
  BarChart3,
  PlayCircle,
} from 'lucide-react'
import { canSeeNavItem } from '@/constants/roles'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/store/auth.store'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getAppointments } from '@/services/appointment.service'
import { getTherapySessions } from '@/services/therapy-session.service'
import { getNotifications, getUnreadCount } from '@/services/notification.service'
import type { Appointment } from '@/types/appointment'
import type { TherapySession } from '@/types/therapy-session'
import type { Notification } from '@/types/notification'

const PSY_COLOR = '#8b5cf6'

function getTodayRange(): { startDate: string; endDate: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

function getNextDaysRange(days: number): { startDate: string; endDate: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  end.setHours(23, 59, 59, 999)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function getWeekKey(iso: string): string {
  const d = new Date(iso)
  const start = new Date(d)
  start.setDate(d.getDate() - d.getDay())
  return start.toISOString().slice(0, 10)
}

function getWeekLabel(weekKey: string): string {
  const d = new Date(weekKey)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
}

type ExpandedPanel = 'citas' | 'pendientes' | null

export function DashboardPsychologist() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [appointmentsToday, setAppointmentsToday] = useState<Appointment[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [reminders, setReminders] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null)

  const todayRange = useMemo(() => getTodayRange(), [])
  const next7Range = useMemo(() => getNextDaysRange(7), [])

  const sessionsThisWeek = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return sessions.filter((s) => {
      const d = new Date(s.sessionDate)
      return d >= weekStart && d <= weekEnd
    }).length
  }, [sessions])

  const chartData = useMemo(() => {
    const weekCounts: Record<string, number> = {}
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    sessions
      .filter((s) => new Date(s.sessionDate) >= fourWeeksAgo)
      .forEach((s) => {
        const key = getWeekKey(s.sessionDate)
        weekCounts[key] = (weekCounts[key] ?? 0) + 1
      })
    return Object.entries(weekCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, count]) => ({ period: getWeekLabel(period), sesiones: count }))
  }, [sessions])

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      getAppointments({ page: 1, limit: 20, startDate: todayRange.startDate, endDate: todayRange.endDate })
        .then((r) => r.appointments),
      getAppointments({ page: 1, limit: 15, startDate: next7Range.startDate, endDate: next7Range.endDate })
        .then((r) => r.appointments),
      getTherapySessions({ therapistId: user.id, limit: 100 })
        .then((r) => r.sessions),
      getNotifications({ page: 1, limit: 5, isRead: false })
        .then((r) => r.notifications),
      getUnreadCount().then((r) => r.count),
    ])
      .then(([today, upcoming, sess, notifs, totalUnread]) => {
        if (cancelled) return
        setAppointmentsToday(today)
        setUpcomingAppointments(upcoming)
        setSessions(sess)
        setReminders(notifs)
        setUnreadCount(totalUnread)
      })
      .catch(() => {
        if (!cancelled) setError(t('common.error'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [user?.id, t, todayRange.startDate, todayRange.endDate, next7Range.startDate, next7Range.endDate])

  const firstName = user?.firstName ?? t('dashboard.psychologist.therapist')
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  if (loading && !appointmentsToday.length && !upcomingAppointments.length && !sessions.length) {
    return (
      <GlassCard>
        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('dashboard.psychologist.loading')}</span>
        </div>
      </GlassCard>
    )
  }

  if (error) {
    return (
      <GlassCard>
        <p className="text-[var(--text-secondary)]">{error}</p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida al inicio */}
      <GlassCard className="border-l-4 border-l-[var(--color-primary)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {t('dashboard.psychologist.welcome')}, {firstName}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t('dashboard.psychologist.roleDescription')}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{todayLabel}</p>
      </GlassCard>

      {/* Citas de hoy: listado con opción Iniciar */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
            {t('dashboard.psychologist.appointmentsToday')}
          </h3>
          <Link to="/appointments" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
            {t('dashboard.psychologist.seeAll')}
          </Link>
        </div>
        {appointmentsToday.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">
            {t('dashboard.psychologist.noAppointmentsToday')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                  <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.dateTime')}</th>
                  <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.patient')}</th>
                  <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.type')}</th>
                  <th className="pb-2 w-24 font-medium text-right">{t('dashboard.psychologist.start')}</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsToday.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--border)]/60">
                    <td className="py-2.5 pr-2 text-[var(--text-primary)] whitespace-nowrap">
                      {formatDate(a.scheduledDate)} {formatTime(a.scheduledDate)}
                    </td>
                    <td className="py-2.5 pr-2 text-[var(--text-primary)]">
                      {a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : '—'}
                    </td>
                    <td className="py-2.5 pr-2 text-[var(--text-secondary)]">{a.appointmentType || '—'}</td>
                    <td className="py-2.5 text-right">
                      <Link
                        to={`/sessions/new?patientId=${encodeURIComponent(a.patient.id)}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/15 px-2.5 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/25"
                      >
                        <PlayCircle size={14} aria-hidden />
                        {t('dashboard.psychologist.start')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Un solo bloque: Citas de hoy, Pendientes, Sesiones esta semana, Últimas sesiones + link calendario */}
      <GlassCard>
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center justify-between rounded-lg py-1 transition-colors hover:bg-[var(--bg)]/50"
            onClick={() => setExpandedPanel((p) => (p === 'citas' ? null : 'citas'))}
            onKeyDown={(e) => e.key === 'Enter' && setExpandedPanel((p) => (p === 'citas' ? null : 'citas'))}
            role="button"
            tabIndex={0}
          >
            <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.psychologist.appointmentsToday')}</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[var(--text-primary)]">{appointmentsToday.length}</span>
              <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </div>
          <div
            className="flex items-center justify-between rounded-lg py-1 transition-colors hover:bg-[var(--bg)]/50"
            onClick={() => setExpandedPanel((p) => (p === 'pendientes' ? null : 'pendientes'))}
            onKeyDown={(e) => e.key === 'Enter' && setExpandedPanel((p) => (p === 'pendientes' ? null : 'pendientes'))}
            role="button"
            tabIndex={0}
          >
            <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.psychologist.pending')}</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[var(--text-primary)]">{unreadCount}</span>
              <Bell className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </div>
          <Link to="/sessions" className="flex items-center justify-between rounded-lg py-1 transition-colors hover:bg-[var(--bg)]/50">
            <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.psychologist.sessionsThisWeek')}</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[var(--text-primary)]">{sessionsThisWeek}</span>
              <MessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </Link>
          <Link to="/sessions" className="flex items-center justify-between rounded-lg py-1 transition-colors hover:bg-[var(--bg)]/50">
            <span className="text-sm text-[var(--text-secondary)]">{t('dashboard.psychologist.recentSessions')}</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[var(--text-primary)]">{sessions.length}</span>
              <ClipboardList className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </Link>
          {canSeeNavItem('/calendar', user?.role) && (
            <Link
              to="/calendar"
              className="mt-2 flex items-center gap-2 border-t border-[var(--border)] pt-4 text-[var(--color-primary)] hover:underline"
            >
              <CalendarDays size={18} />
              <span>{t('calendar.shortcutTitle')}</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </GlassCard>

      {expandedPanel === 'citas' && (
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {t('dashboard.psychologist.appointmentsToday')}
            </h3>
            <div className="flex items-center gap-2">
              <Link
                to="/appointments"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                {t('dashboard.psychologist.seeAll')}
              </Link>
              <button
                type="button"
                onClick={() => setExpandedPanel(null)}
                className="rounded-lg px-2 py-1 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
          </div>
          {appointmentsToday.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">
              {t('dashboard.psychologist.noUpcomingAppointments')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.dateTime')}</th>
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.patient')}</th>
                    <th className="pb-2 font-medium">{t('dashboard.psychologist.type')}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsToday.map((a) => (
                    <tr key={a.id} className="border-b border-[var(--border)]/60">
                      <td className="py-2.5 pr-2 text-[var(--text-primary)] whitespace-nowrap">
                        {formatDate(a.scheduledDate)} {formatTime(a.scheduledDate)}
                      </td>
                      <td className="py-2.5 pr-2 text-[var(--text-primary)]">
                        {a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : '—'}
                      </td>
                      <td className="py-2.5 text-[var(--text-secondary)]">{a.appointmentType || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {expandedPanel === 'pendientes' && (
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {t('dashboard.psychologist.reminders')}
            </h3>
            <div className="flex items-center gap-2">
              <Link
                to="/notifications"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                {t('dashboard.psychologist.seeAll')}
              </Link>
              <button
                type="button"
                onClick={() => setExpandedPanel(null)}
                className="rounded-lg px-2 py-1 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
          </div>
          {reminders.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">
              {t('dashboard.psychologist.noReminders')}
            </p>
          ) : (
            <ul className="space-y-3">
              {reminders.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-3"
                >
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{n.title}</p>
                    <p className="mt-0.5 text-sm text-[var(--text-secondary)] line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {formatDate(n.createdAt)} {formatTime(n.createdAt)}
                    </p>
                  </div>
                  <Link to="/notifications" className="shrink-0 text-sm font-medium text-[var(--color-primary)] hover:underline">
                    {t('dashboard.psychologist.view')}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximas citas */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[var(--color-primary)]" />
              {t('dashboard.psychologist.upcomingAppointments')}
            </h3>
            <Link
              to="/appointments"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              {t('dashboard.psychologist.seeAll')}
            </Link>
          </div>
          <div className="overflow-x-auto">
            {upcomingAppointments.length === 0 ? (
              <p className="py-4 text-center text-sm text-[var(--text-muted)]">
                {t('dashboard.psychologist.noUpcomingAppointments')}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.dateTime')}</th>
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.patient')}</th>
                    <th className="pb-2 font-medium">{t('dashboard.psychologist.type')}</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.slice(0, 8).map((a) => (
                    <tr key={a.id} className="border-b border-[var(--border)]/60">
                      <td className="py-2.5 pr-2 text-[var(--text-primary)] whitespace-nowrap">
                        {formatDate(a.scheduledDate)} {formatTime(a.scheduledDate)}
                      </td>
                      <td className="py-2.5 pr-2 text-[var(--text-primary)]">
                        {a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : '—'}
                      </td>
                      <td className="py-2.5 text-[var(--text-secondary)]">{a.appointmentType || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>

        {/* Últimas sesiones */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[var(--color-primary)]" />
              {t('dashboard.psychologist.recentSessions')}
            </h3>
            <Link
              to="/sessions"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              {t('dashboard.psychologist.seeAll')}
            </Link>
          </div>
          <div className="overflow-x-auto">
            {sessions.length === 0 ? (
              <p className="py-4 text-center text-sm text-[var(--text-muted)]">
                {t('dashboard.psychologist.noSessions')}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                    <th className="pb-2 pr-2 font-medium">#</th>
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.patient')}</th>
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.psychologist.date')}</th>
                    <th className="pb-2 font-medium">{t('sessions.duration')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 8).map((s) => (
                    <tr key={s.id} className="border-b border-[var(--border)]/60">
                      <td className="py-2.5 pr-2 text-[var(--text-primary)]">{s.sessionNumber}</td>
                      <td className="py-2.5 pr-2 text-[var(--text-primary)]">
                        {s.psychologyRecord?.medicalRecord?.patient?.user
                          ? `${s.psychologyRecord.medicalRecord.patient.user.firstName} ${s.psychologyRecord.medicalRecord.patient.user.lastName}`
                          : '—'}
                      </td>
                      <td className="py-2.5 pr-2 text-[var(--text-secondary)]">{formatDate(s.sessionDate)}</td>
                      <td className="py-2.5 text-[var(--text-secondary)]">{s.sessionDuration} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Gráfica: sesiones por semana */}
      <GlassCard>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
          {t('dashboard.psychologist.sessionsByWeek')}
        </h3>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-muted)]">
            {t('dashboard.psychologist.noChartData')}
          </p>
        ) : (
          <div className="h-64 min-h-[200px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="sesiones" fill={PSY_COLOR} radius={[4, 4, 0, 0]} name={t('dashboard.psychologist.sessionsLabel')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
