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
  CalendarPlus,
  X,
  Users,
  Cake,
  Sparkles,
  Mail,
  MessageCircle,
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

import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { cancelAppointment, getAppointments, rescheduleAppointment, getQueue, createAppointment, updateWaitingListStatus, type WaitingListEntry } from '@/services/appointment.service'
import { getPatients } from '@/services/patient.service'
import { getTherapySessions } from '@/services/therapy-session.service'
import { getNotifications, getUnreadCount } from '@/services/notification.service'
import { getMyProfile } from '@/services/profile.service'
import type { Appointment } from '@/types/appointment'
import type { TherapySession } from '@/types/therapy-session'
import type { Notification } from '@/types/notification'
import type { Patient } from '@/types/patient'
import { HOLIDAYS_MM_DD } from '@/utils/calendarActivities'
import { APPOINTMENT_STATUS, DEPARTMENT_KEYS } from '@/types/appointment'
import { getStatusBadgeClass } from '@/utils/tableRowColors'

const PSY_COLOR = '#8b5cf6'

const MOTIVATIONAL_PHRASES = [
  '¡Tu empatía y escucha cambian vidas hoy! 🧠✨',
  'Cada sesión es una oportunidad para sanar y crecer. 🤝🌱',
  'Tu dedicación marca la diferencia en el bienestar de cada estudiante. 💡💙',
  'Escuchar con el corazón es tu mayor superpoder. 💖🗣️',
  'Hoy es un gran día para guiar a alguien hacia su paz interior. 🌅🧘',
  'El camino al bienestar comienza con un paso, gracias por guiar ese camino. 👣⭐',
  'Tu presencia y escucha atenta son el mejor refugio para quien lo necesita. 🏡🌟',
  'Acompañar y comprender es un arte, y hoy harás una gran diferencia. 🎨❤️',
  'Con tu apoyo y guía, cada obstáculo se convierte en aprendizaje. 🚀🌱',
  'Tu dedicación y calidez construyen un espacio seguro y lleno de esperanza. 🛡️✨',
]

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

function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${hh}:${mm}`
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
  const [queue, setQueue] = useState<WaitingListEntry[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null)

  // Seleccionar frase motivacional aleatoria una sola vez al montar
  const welcomePhrase = useMemo(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)
    return MOTIVATIONAL_PHRASES[idx]
  }, [])

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [rescheduleDateTime, setRescheduleDateTime] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [cancelModalError, setCancelModalError] = useState<string | null>(null)
  const [rescheduleModalError, setRescheduleModalError] = useState<string | null>(null)

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedQueueEntry, setSelectedQueueEntry] = useState<WaitingListEntry | null>(null)

  const openScheduleModal = (entry: WaitingListEntry) => {
    setSelectedQueueEntry(entry)
    setScheduleModalOpen(true)
  }

  const handleScheduleSuccess = async () => {
    await refreshAppointmentsToday()
    const qList = await getQueue()
    setQueue(qList)
  }

  const toggleExpand = (id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id))
  }

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
      getQueue().catch(() => [] as WaitingListEntry[]),
      getPatients({ limit: 300 }).then((r) => r.patients).catch(() => [] as Patient[]),
    ])
      .then(([today, upcoming, sess, notifs, totalUnread, qList, pts]) => {
        if (cancelled) return
        setAppointmentsToday(today)
        setUpcomingAppointments(upcoming)
        setSessions(sess)
        setReminders(notifs)
        setUnreadCount(totalUnread)
        setQueue(qList)
        setPatients(pts)
      })
      .catch(() => {
        if (!cancelled) setError(t('common.error'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [user?.id, t, todayRange.startDate, todayRange.endDate, next7Range.startDate, next7Range.endDate])

  const refreshAppointmentsToday = async () => {
    const r = await getAppointments({
      page: 1,
      limit: 20,
      startDate: todayRange.startDate,
      endDate: todayRange.endDate,
    })
    setAppointmentsToday(r.appointments)
  }

  // Si la cita cambia de estado (ej. "completada") desde otras pantallas,
  // o se agregan alumnos a la fila virtual, necesitamos refrescar la tabla.
  useEffect(() => {
    if (!user?.id) return

    let cancelled = false
    const tick = async () => {
      if (cancelled) return
      try {
        await refreshAppointmentsToday()
        const qList = await getQueue()
        if (!cancelled) setQueue(qList)
      } catch {
        // Silenciar; el siguiente tick reintenta.
      }
    }

    void tick()
    const intervalId = window.setInterval(() => {
      void tick()
    }, 10000)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void tick()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [user?.id, todayRange.startDate, todayRange.endDate])

  type EffectiveAppointmentStatus = 'cancelled' | 'rescheduled' | 'completed' | 'scheduled'

  const getEffectiveAppointmentStatus = (a: Appointment): EffectiveAppointmentStatus => {
    if (a.status === APPOINTMENT_STATUS.CANCELLED) return 'cancelled'
    if (a.status === APPOINTMENT_STATUS.COMPLETED) return 'completed'
    if ((a.status === APPOINTMENT_STATUS.SCHEDULED || a.status === APPOINTMENT_STATUS.CONFIRMED) && a.rescheduleReason) {
      return 'rescheduled'
    }
    return 'scheduled'
  }

  const getEffectiveStatusVariant = (effectiveStatus: EffectiveAppointmentStatus): 'success' | 'warning' | 'error' => {
    switch (effectiveStatus) {
      case 'completed':
        return 'success'
      case 'rescheduled':
        return 'warning'
      case 'cancelled':
        return 'error'
      case 'scheduled':
      default:
        return 'warning'
    }
  }

  const getEffectiveStatusLabel = (effectiveStatus: EffectiveAppointmentStatus) => {
    switch (effectiveStatus) {
      case 'cancelled':
        return t('appointments.statusCancelled', 'Cancelada')
      case 'rescheduled':
        return t('sessions.statusRescheduled', 'Reagendada')
      case 'completed':
        return t('appointments.statusCompleted', 'Completada')
      case 'scheduled':
      default:
        return t('appointments.statusScheduled', 'Programada')
    }
  }



  const openCancelModal = (a: Appointment) => {
    setSelectedAppointment(a)
    setCancelReason('')
    setCancelModalError(null)
    setCancelModalOpen(true)
  }

  const openRescheduleModal = (a: Appointment) => {
    setSelectedAppointment(a)
    setRescheduleReason('')
    setRescheduleModalError(null)
    setRescheduleDateTime(toDateTimeLocalValue(a.scheduledDate))
    setRescheduleModalOpen(true)
  }

  const confirmCancel = async () => {
    if (!selectedAppointment) return
    const reason = cancelReason.trim()
    if (!reason) {
      setCancelModalError(t('appointments.cancellationReason', 'Motivo de cancelación') + ' es requerido')
      return
    }
    setActionLoading(true)
    try {
      await cancelAppointment(selectedAppointment.id, reason)
      setCancelModalOpen(false)
      await refreshAppointmentsToday()
    } catch {
      setCancelModalError(t('common.error', 'Error'))
    } finally {
      setActionLoading(false)
    }
  }

  const confirmReschedule = async () => {
    if (!selectedAppointment) return
    const reason = rescheduleReason.trim()
    if (!rescheduleDateTime) {
      setRescheduleModalError(t('sessions.newSessionDate', 'Nueva fecha es requerida'))
      return
    }
    if (!reason) {
      setRescheduleModalError(t('sessions.rescheduleReason', 'Motivo de reagendar') + ' es requerido')
      return
    }
    const iso = new Date(rescheduleDateTime).toISOString()
    setActionLoading(true)
    try {
      await rescheduleAppointment(selectedAppointment.id, iso, reason)
      setRescheduleModalOpen(false)
      await refreshAppointmentsToday()
    } catch {
      setRescheduleModalError(t('common.error', 'Error'))
    } finally {
      setActionLoading(false)
    }
  }

  const firstName = user?.firstName ?? t('dashboard.psychologist.therapist')
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const todayEvents = useMemo(() => {
    const now = new Date()
    const todayMonth = now.getMonth()
    const todayDate = now.getDate()

    // Filter patient birthdays for today
    const birthdays = patients
      .filter((p) => {
        if (!p.user?.dateOfBirth) return false
        const dob = new Date(p.user.dateOfBirth)
        return dob.getMonth() === todayMonth && dob.getDate() === todayDate
      })
      .map((p) => ({
        id: `bday-${p.id}`,
        name: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Paciente',
        type: 'birthday',
        phone: p.user?.phone || null,
        email: p.user?.email || null,
      }))

    // Filter holidays for today
    const mm = String(todayMonth + 1).padStart(2, '0')
    const dd = String(todayDate).padStart(2, '0')
    const key = `${mm}-${dd}`
    const holidays = HOLIDAYS_MM_DD
      .filter((h) => h.key === key)
      .map((h) => ({
        id: `holiday-${h.key}`,
        name: h.label,
        type: 'holiday',
        phone: null,
        email: null,
      }))

    return [...birthdays, ...holidays]
  }, [patients])

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
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          {t('dashboard.psychologist.welcome')}, {firstName} 👋
        </h2>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)] font-sans italic">
          "{welcomePhrase}"
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">{todayLabel}</p>
      </GlassCard>

      {/* Fila Virtual (Lista de Espera) */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="h-5 w-5 text-[var(--color-primary)]" />
            Fila Virtual (Lista de Espera)
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            {queue.length} en espera
          </span>
        </div>
        {queue.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">
            No hay alumnos en la fila virtual de tus carreras asignadas.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {queue.map((entry) => {
              const registerTime = new Date(entry.createdAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })
              const isExpanded = expandedItemId === `queue-${entry.id}`
              const patientName = entry.patient?.user ? `${entry.patient.user.firstName} ${entry.patient.user.lastName}` : 'Alumno'
              const careerName = entry.patient?.career?.name || '—'

              return (
                <div
                  key={entry.id}
                  onClick={() => toggleExpand(`queue-${entry.id}`)}
                  className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/30 px-4 py-3 transition-all duration-300 hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/20 hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate font-sans">
                        {patientName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
                        Reg: {registerTime} • {careerName}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                        En espera
                      </span>
                    </div>
                  </div>

                  <div className={`flex flex-col gap-2.5 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2.5 pt-2.5 border-t border-[var(--border)]/40' : 'max-h-0 opacity-0 border-t-0 pt-0 mt-0 group-hover:max-h-96 group-hover:opacity-100 group-hover:mt-2.5 group-hover:pt-2.5 group-hover:border-t group-hover:border-[var(--border)]/40'}`}>
                    <div className="space-y-1 text-xs text-[var(--text-secondary)] font-sans">
                      <p>
                        <span className="font-semibold text-[var(--text-primary)] font-sans">Motivo:</span> {entry.reason || 'Sin motivo especificado'}
                      </p>
                      <p>
                        <span className="font-semibold text-[var(--text-primary)] font-sans">Prioridad:</span> {entry.priority}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/sessions/new?patientId=${encodeURIComponent(entry.patient.id)}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/15 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/25"
                      >
                        <PlayCircle size={13} />
                        Atender
                      </Link>
                      <button
                        type="button"
                        onClick={() => openScheduleModal(entry)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
                      >
                        <CalendarPlus size={13} />
                        Agendar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
          <div className="grid gap-3 sm:grid-cols-2">
            {appointmentsToday.map((a) => {
              const effectiveStatus = getEffectiveAppointmentStatus(a)
              const effectiveVariant = getEffectiveStatusVariant(effectiveStatus)
              const isExpanded = expandedItemId === `appt-${a.id}`
              const patientName = a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : 'Paciente'
              const apptTypeLabel = a.appointmentType ? t(`calendar.types.${a.appointmentType}`, a.appointmentType) : 'Cita clínica'

              return (
                <div
                  key={a.id}
                  onClick={() => toggleExpand(`appt-${a.id}`)}
                  className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/30 px-4 py-3 transition-all duration-300 hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/20 hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate font-sans">
                        {patientName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
                        {formatTime(a.scheduledDate)} • {apptTypeLabel}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={getStatusBadgeClass(effectiveVariant)}>
                        {getEffectiveStatusLabel(effectiveStatus)}
                      </span>
                    </div>
                  </div>

                  <div className={`flex flex-col gap-2.5 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2.5 pt-2.5 border-t border-[var(--border)]/40' : 'max-h-0 opacity-0 border-t-0 pt-0 mt-0 group-hover:max-h-96 group-hover:opacity-100 group-hover:mt-2.5 group-hover:pt-2.5 group-hover:border-t group-hover:border-[var(--border)]/40'}`}>
                    <div className="space-y-1 text-xs text-[var(--text-secondary)] font-sans">
                      <p>
                        <span className="font-semibold text-[var(--text-primary)]">Fecha:</span> {formatDate(a.scheduledDate)} {formatTime(a.scheduledDate)}
                      </p>
                      <p>
                        <span className="font-semibold text-[var(--text-primary)]">Departamento:</span> {DEPARTMENT_KEYS[a.department] ? t(`appointments.${DEPARTMENT_KEYS[a.department]}`) : a.department}
                      </p>
                      {a.professional && (
                        <p>
                          <span className="font-semibold text-[var(--text-primary)]">Profesional:</span> {a.professional.firstName} {a.professional.lastName}
                        </p>
                      )}
                      {a.notes && (
                        <p className="whitespace-pre-wrap">
                          <span className="font-semibold text-[var(--text-primary)]">Notas:</span> {a.notes}
                        </p>
                      )}
                      {effectiveStatus === 'cancelled' && a.cancellationReason && (
                        <p className="whitespace-pre-wrap text-[var(--color-error)]">
                          <span className="font-semibold">Motivo de cancelación:</span> {a.cancellationReason}
                        </p>
                      )}
                      {effectiveStatus === 'rescheduled' && a.rescheduleReason && (
                        <p className="whitespace-pre-wrap text-amber-500">
                          <span className="font-semibold">Motivo de reagendar:</span> {a.rescheduleReason}
                        </p>
                      )}
                    </div>

                    {effectiveStatus === 'scheduled' && (
                      <div className="flex flex-wrap gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/sessions/new?patientId=${encodeURIComponent(a.patient.id)}&appointmentId=${encodeURIComponent(a.id)}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/15 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/25"
                        >
                          <PlayCircle size={13} />
                          Iniciar
                        </Link>
                        <button
                          type="button"
                          onClick={() => openRescheduleModal(a)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
                        >
                          <CalendarPlus size={13} />
                          Reagendar
                        </button>
                        <button
                          type="button"
                          onClick={() => openCancelModal(a)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
                        >
                          <X size={13} />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      {/* Efemérides y Cumpleaños Hoy */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
            Efemérides y Cumpleaños Hoy
          </h3>
        </div>
        {todayEvents.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-muted)] font-sans">
            Hoy no hay efemérides ni cumpleaños programados. 🗓️
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {todayEvents.map((evt) => {
              const isExpanded = expandedItemId === evt.id
              return (
                <div
                  key={evt.id}
                  onClick={() => toggleExpand(evt.id)}
                  className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/30 px-4 py-3 transition-all duration-300 hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/20 hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    {evt.type === 'birthday' ? (
                      <>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                          <Cake className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate font-sans">
                            ¡Feliz Cumpleaños a {evt.name}! 🎉
                          </p>
                          <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
                            Deseándole un excelente día.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate font-sans">
                            {evt.name} 🇲🇽
                          </p>
                          <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
                            Efeméride / Conmemoración
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {evt.type === 'birthday' && (evt.phone || evt.email) && (
                    <div className={`flex flex-col gap-2.5 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-24 opacity-100 mt-2.5 pt-2.5 border-t border-[var(--border)]/40' : 'max-h-0 opacity-0 border-t-0 pt-0 mt-0 group-hover:max-h-24 group-hover:opacity-100 group-hover:mt-2.5 group-hover:pt-2.5 group-hover:border-t group-hover:border-[var(--border)]/40'}`}>
                      <div className="flex flex-wrap gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                        {evt.phone && (
                          <a
                            href={`https://wa.me/${evt.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#128c7e]/15 px-3 py-2 text-xs font-semibold text-[#128c7e] transition-colors hover:bg-[#128c7e]/25 font-sans"
                          >
                            <MessageCircle size={14} />
                            WhatsApp
                          </a>
                        )}
                        {evt.email && (
                          <a
                            href={`mailto:${evt.email}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb]/15 px-3 py-2 text-xs font-semibold text-[#2563eb] transition-colors hover:bg-[#2563eb]/25 font-sans"
                          >
                            <Mail size={14} />
                            Correo
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      <ConfirmModal
        open={cancelModalOpen}
        onClose={() => {
          if (!actionLoading) {
            setCancelModalOpen(false)
            setCancelModalError(null)
          }
        }}
        onConfirm={() => void confirmCancel()}
        confirming={actionLoading}
        title={t('sessions.cancel', 'Cancelar cita')}
        message={t('sessions.cancelConfirm', 'Ingresa el motivo de cancelación')}
        confirmLabel={t('sessions.confirmCancel', 'Confirmar')}
        cancelLabel={t('common.close')}
        variant="danger"
        detail={
          <div className="space-y-2">
            <textarea
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value)
                setCancelModalError(null)
              }}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              rows={4}
              placeholder={t('appointments.cancellationReason', 'Motivo de cancelación')}
            />
            {cancelModalError && <p className="text-xs text-[var(--color-error)]">{cancelModalError}</p>}
          </div>
        }
      />

      <ConfirmModal
        open={rescheduleModalOpen}
        onClose={() => {
          if (!actionLoading) {
            setRescheduleModalOpen(false)
            setRescheduleModalError(null)
          }
        }}
        onConfirm={() => void confirmReschedule()}
        confirming={actionLoading}
        title={t('sessions.reschedule', 'Reagendar cita')}
        message={t('sessions.rescheduleConfirm', 'Ingresa la nueva fecha/hora y el motivo')}
        confirmLabel={t('sessions.confirmReschedule', 'Confirmar')}
        cancelLabel={t('common.close')}
        detail={
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                {t('sessions.newSessionDate', 'Nueva fecha y hora')}
              </label>
              <input
                type="datetime-local"
                value={rescheduleDateTime}
                onChange={(e) => {
                  setRescheduleDateTime(e.target.value)
                  setRescheduleModalError(null)
                }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                {t('sessions.rescheduleReason', 'Motivo de reagendar')}
              </label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => {
                  setRescheduleReason(e.target.value)
                  setRescheduleModalError(null)
                }}
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
                rows={4}
              />
            </div>
            {rescheduleModalError && <p className="text-xs text-[var(--color-error)]">{rescheduleModalError}</p>}
          </div>
        }
      />

      <ScheduleQueueModal
        entry={selectedQueueEntry}
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false)
          setSelectedQueueEntry(null)
        }}
        onSuccess={() => void handleScheduleSuccess()}
      />



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
            <div className="grid gap-3 sm:grid-cols-2">
              {appointmentsToday.map((a) => {
                const effectiveStatus = getEffectiveAppointmentStatus(a)
                const effectiveVariant = getEffectiveStatusVariant(effectiveStatus)
                const isExpanded = expandedItemId === `appt-side-${a.id}`
                const patientName = a.patient?.user ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : 'Paciente'
                const apptTypeLabel = a.appointmentType ? t(`calendar.types.${a.appointmentType}`, a.appointmentType) : 'Cita clínica'

                return (
                  <div
                    key={a.id}
                    onClick={() => toggleExpand(`appt-side-${a.id}`)}
                    className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/30 px-4 py-3 transition-all duration-300 hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/20 hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate font-sans">
                          {patientName}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
                          {formatTime(a.scheduledDate)} • {apptTypeLabel}
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className={getStatusBadgeClass(effectiveVariant)}>
                          {getEffectiveStatusLabel(effectiveStatus)}
                        </span>
                      </div>
                    </div>

                    <div className={`flex flex-col gap-2.5 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2.5 pt-2.5 border-t border-[var(--border)]/40' : 'max-h-0 opacity-0 border-t-0 pt-0 mt-0 group-hover:max-h-96 group-hover:opacity-100 group-hover:mt-2.5 group-hover:pt-2.5 group-hover:border-t group-hover:border-[var(--border)]/40'}`}>
                      <div className="space-y-1 text-xs text-[var(--text-secondary)] font-sans">
                        <p>
                          <span className="font-semibold text-[var(--text-primary)]">Fecha:</span> {formatDate(a.scheduledDate)} {formatTime(a.scheduledDate)}
                        </p>
                        <p>
                          <span className="font-semibold text-[var(--text-primary)]">Departamento:</span> {DEPARTMENT_KEYS[a.department] ? t(`appointments.${DEPARTMENT_KEYS[a.department]}`) : a.department}
                        </p>
                        {a.professional && (
                          <p>
                            <span className="font-semibold text-[var(--text-primary)]">Profesional:</span> {a.professional.firstName} {a.professional.lastName}
                          </p>
                        )}
                        {a.notes && (
                          <p className="whitespace-pre-wrap">
                            <span className="font-semibold text-[var(--text-primary)]">Notas:</span> {a.notes}
                          </p>
                        )}
                        {effectiveStatus === 'cancelled' && a.cancellationReason && (
                          <p className="whitespace-pre-wrap text-[var(--color-error)]">
                            <span className="font-semibold">Motivo de cancelación:</span> {a.cancellationReason}
                          </p>
                        )}
                        {effectiveStatus === 'rescheduled' && a.rescheduleReason && (
                          <p className="whitespace-pre-wrap text-amber-500">
                            <span className="font-semibold">Motivo de reagendar:</span> {a.rescheduleReason}
                          </p>
                        )}
                      </div>

                      {effectiveStatus === 'scheduled' && (
                        <div className="flex flex-wrap gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/sessions/new?patientId=${encodeURIComponent(a.patient.id)}&appointmentId=${encodeURIComponent(a.id)}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/15 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/25"
                          >
                            <PlayCircle size={13} />
                            Iniciar
                          </Link>
                          <button
                            type="button"
                            onClick={() => openRescheduleModal(a)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
                          >
                            <CalendarPlus size={13} />
                            Reagendar
                          </button>
                          <button
                            type="button"
                            onClick={() => openCancelModal(a)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
                          >
                            <X size={13} />
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
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
                      <td className="py-2.5 text-[var(--text-secondary)]">{a.appointmentType ? t(`calendar.types.${a.appointmentType}`, a.appointmentType) : '—'}</td>
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

interface ScheduleQueueModalProps {
  entry: WaitingListEntry | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ScheduleQueueModal({ entry, isOpen, onClose, onSuccess }: ScheduleQueueModalProps) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('initial_consultation')
  const [notes, setNotes] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [therapistPhone, setTherapistPhone] = useState('')
  const [therapistEmail, setTherapistEmail] = useState('')
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      getMyProfile()
        .then((profile) => {
          setTherapistPhone(profile.phone || '')
          setTherapistEmail(profile.email || '')
        })
        .catch((err) => console.error('Error fetching therapist profile:', err))
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && entry) {
      const today = new Date().toISOString().slice(0, 10)
      setSelectedDate(today)
      setSelectedTime('')
      setAppointmentType('initial_consultation')
      setNotes(entry.reason || '')
      setPatientPhone(entry.patient.user.phone || '')
      setPatientEmail(entry.patient.user.email || '')
      setSuccess(false)
      setError(null)
    }
  }, [isOpen, entry])

  useEffect(() => {
    if (!isOpen || !selectedDate || !user?.id) return
    let active = true
    const fetchDayAppointments = async () => {
      setLoadingAvailability(true)
      try {
        const startOfDay = new Date(`${selectedDate}T00:00:00`)
        const endOfDay = new Date(`${selectedDate}T23:59:59`)
        const res = await getAppointments({
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
          limit: 100,
        })
        if (active) {
          setDayAppointments(res.appointments)
        }
      } catch (err) {
        console.error('Error fetching day appointments:', err)
      } finally {
        if (active) setLoadingAvailability(false)
      }
    }
    void fetchDayAppointments()
    return () => {
      active = false
    }
  }, [isOpen, selectedDate, user?.id])

  useEffect(() => {
    if (entry && user) {
      const timeStr = selectedTime ? ` a las ${selectedTime}` : ''
      const dateObj = new Date(`${selectedDate}T12:00:00`)
      const dateFormatted = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
      
      const details = []
      if (therapistEmail) details.push(`Correo: ${therapistEmail}`)
      if (therapistPhone) details.push(`Teléfono: ${therapistPhone}`)
      const contactInfo = details.join(' | ') || 'mis medios de contacto'

      setCustomMessage(
        `Hola, gracias por contactarme soy ${user.firstName} ${user.lastName} y yo seré tu psicólogo(a). Tu cita ha sido programada para el día ${dateFormatted}${timeStr}. No te preocupes, nosotros te apoyaremos en tu proceso, para cualquier duda o aclaración estos son mis medios de contacto: ${contactInfo}.`
      )
    }
  }, [entry, user, selectedDate, selectedTime, therapistPhone, therapistEmail])

  if (!isOpen || !entry) return null

  const isSlotOccupied = (slotTime: string) => {
    const [sh, sm] = slotTime.split(':').map(Number)
    const slotStart = new Date(`${selectedDate}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`)
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)

    return dayAppointments.some((a) => {
      if (a.status === APPOINTMENT_STATUS.CANCELLED) return false
      const apptStart = new Date(a.scheduledDate)
      const duration = Math.min(90, Math.max(45, a.durationMinutes || 60))
      const apptEnd = new Date(apptStart.getTime() + duration * 60 * 1000)

      return (
        (slotStart >= apptStart && slotStart < apptEnd) ||
        (slotEnd > apptStart && slotEnd <= apptEnd) ||
        (slotStart <= apptStart && slotEnd >= apptEnd)
      )
    })
  }

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTime) {
      setError('Debes seleccionar un horario para la cita.')
      return
    }
    setSubmitting(true)
    setError(null)

    const scheduledDateStr = `${selectedDate}T${selectedTime}:00`
    const scheduledDate = new Date(scheduledDateStr)

    try {
      await createAppointment({
        patientId: entry.patientId,
        professionalId: user!.id,
        appointmentType,
        department: entry.department || 'psicologia',
        scheduledDate: scheduledDate.toISOString(),
        durationMinutes: 60,
        notes,
      })

      await updateWaitingListStatus(entry.id, 'programada')
      setSuccess(true)
    } catch (err: any) {
      const msg = err.response?.data?.message || t('common.error')
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const cleanPhone = patientPhone.replace(/\D/g, '')
  const waPhone = cleanPhone.length === 10 ? '52' + cleanPhone : cleanPhone
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(customMessage)}`
  const mailUrl = `mailto:${patientEmail}?subject=${encodeURIComponent('Confirmación de Cita - UT Care')}&body=${encodeURIComponent(customMessage)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-2xl overflow-y-auto max-h-[90vh] font-sans">
        
        <div className="flex items-center justify-between border-b border-[var(--border)]/40 pb-4 mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {success ? '¡Cita Agendada con Éxito!' : 'Agendar Cita desde Fila Virtual'}
          </h3>
          <button
            onClick={() => {
              if (success) onSuccess()
              onClose()
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors font-sans"
          >
            <X size={20} />
          </button>
        </div>

        {!success ? (
          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border)]/40 text-sm text-[var(--text-secondary)] space-y-1">
              <p><span className="font-semibold text-[var(--text-primary)] font-sans">Alumno:</span> {entry.patient.user.firstName} {entry.patient.user.lastName}</p>
              <p><span className="font-semibold text-[var(--text-primary)] font-sans">Carrera:</span> {entry.patient.career?.name || '—'}</p>
              <p><span className="font-semibold text-[var(--text-primary)] font-sans">Motivo Kiosko:</span> {entry.reason || 'Sin motivo'}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1.5 font-sans">
                Tipo de Cita
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] transition focus:ring-2 focus:ring-[var(--color-primary)] font-sans"
              >
                <option value="initial_consultation">{t('calendar.types.initial_consultation', 'Consulta inicial')}</option>
                <option value="follow_up">{t('calendar.types.follow_up', 'Seguimiento')}</option>
                <option value="emergency">{t('calendar.types.emergency', 'Urgencia')}</option>
                <option value="routine">{t('calendar.types.routine', 'Rutina')}</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1.5 font-sans">
                  Fecha de Cita
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedTime('')
                  }}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] transition focus:ring-2 focus:ring-[var(--color-primary)] font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1.5 font-sans">
                  Hora Seleccionada
                </label>
                <input
                  type="text"
                  value={selectedTime ? `${selectedTime} hrs` : 'Selecciona abajo'}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--glass-bg)]/40 px-3.5 py-2.5 text-sm text-[var(--text-muted)] font-sans"
                  disabled
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2 font-sans">
                Agenda Visual de Disponibilidad (Bloques Ocupados)
              </label>
              {loadingAvailability ? (
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] py-4 font-sans justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                  <span>Cargando disponibilidad de la agenda...</span>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {timeSlots.map((time) => {
                    const occupied = isSlotOccupied(time)
                    const isSelected = selectedTime === time
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={occupied}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center border font-sans ${
                          occupied
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                            : 'bg-[var(--bg-secondary)]/50 border-[var(--border)]/40 text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5'
                        }`}
                      >
                        <span>{time}</span>
                        <span className="text-[9px] font-normal mt-0.5 opacity-80">
                          {occupied ? 'Ocupado' : 'Libre'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1.5 font-sans">
                Notas / Observaciones
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] transition focus:ring-2 focus:ring-[var(--color-primary)] font-sans"
                rows={3}
                placeholder="Ingresar notas clínicas o motivos específicos de la cita..."
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-sans">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition font-sans"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedTime}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary)]/95 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 font-sans"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Agendar Cita
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 py-2">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h4 className="text-base font-semibold text-[var(--text-primary)]">
                ¡Cita programada con éxito!
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm font-sans">
                La cita ha sido guardada y el paciente ha sido removido de la Fila Virtual. Notifica al paciente ahora.
              </p>
            </div>

            <div className="space-y-3.5 border-t border-b border-[var(--border)]/40 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)]/60 bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-sans"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)]/60 bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-sans"
                    placeholder="Celular (10 dígitos)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans mb-1">
                  Mensaje de Confirmación a Enviar
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full resize-none rounded-xl border border-[var(--border)]/60 bg-[var(--bg-secondary)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] font-sans"
                  rows={4}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans mb-1">
                    Tu Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={therapistPhone}
                    onChange={(e) => setTherapistPhone(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)]/60 bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-sans"
                    placeholder="Tu celular de contacto"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-sans mb-1">
                    Tu Correo de Contacto
                  </label>
                  <input
                    type="email"
                    value={therapistEmail}
                    onChange={(e) => setTherapistEmail(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)]/60 bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-primary)] font-sans"
                    placeholder="Tu correo de contacto"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors bg-[#128c7e] hover:bg-[#075e54] font-sans shadow-sm"
              >
                <MessageCircle size={18} />
                Notificar vía WhatsApp
              </a>
              <a
                href={mailUrl}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors bg-[#2563eb] hover:bg-[#1d4ed8] font-sans shadow-sm"
              >
                <Mail size={18} />
                Notificar vía Correo
              </a>
              <button
                type="button"
                onClick={() => {
                  onSuccess()
                  onClose()
                }}
                className="w-full py-2 rounded-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition font-sans"
              >
                Terminar sin enviar notificación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
