import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getPsychologists } from '@/services/supervision-psychologists.service'
import type { PsychologistWithCareers } from '@/services/supervision-psychologists.service'
import { getAppointments } from '@/services/appointment.service'
import type { Appointment } from '@/types/appointment'
import { APPOINTMENT_STATUS } from '@/types/appointment'

const STATUS_KEYS: Record<string, string> = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'statusScheduled',
  [APPOINTMENT_STATUS.CONFIRMED]: 'statusConfirmed',
  [APPOINTMENT_STATUS.COMPLETED]: 'statusCompleted',
  [APPOINTMENT_STATUS.CANCELLED]: 'statusCancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'statusNoShow',
}

function getWeekRange(weekStart: Date): { start: Date; end: Date } {
  const start = new Date(weekStart)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - (day === 0 ? 6 : day - 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatWeekLabel(weekStart: Date, locale: string): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  const d1 = weekStart.getDate()
  const d2 = end.getDate()
  const m1 = weekStart.toLocaleDateString(locale, { month: 'short' })
  const m2 = end.toLocaleDateString(locale, { month: 'short' })
  const y = weekStart.getFullYear()
  if (m1 === m2) return `${d1}-${d2} ${m1} ${y}`
  return `${d1} ${m1} – ${d2} ${m2} ${y}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function fullName(u: { firstName: string; lastName: string }): string {
  return `${u.firstName} ${u.lastName}`.trim()
}

/** Gestión de Itinerario: calendario centralizado para ver y editar las agendas de cada psicólogo. */
export function SupervisionCalendarPage() {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [psychologists, setPsychologists] = useState<PsychologistWithCareers[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()))
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<string[]>([])

  const { start, end } = useMemo(() => getWeekRange(weekStart), [weekStart])
  const weekDays = useMemo(() => {
    const days: Date[] = []
    const d = new Date(start)
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return days
  }, [start])

  const loadPsychologists = useCallback(() => {
    getPsychologists({ page: 1, limit: 100 })
      .then((r) => setPsychologists(r.users))
      .catch(() => {})
  }, [])

  const loadAppointments = useCallback(() => {
    setLoading(true)
    setError(null)
    getAppointments({
      department: 'psychology',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      limit: 150,
    })
      .then((r) => setAppointments(r.appointments))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [start, end, t])

  useEffect(() => {
    loadPsychologists()
  }, [loadPsychologists])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const filteredAppointments = useMemo(() => {
    if (selectedProfessionalIds.length === 0) return appointments
    const set = new Set(selectedProfessionalIds)
    return appointments.filter((a) => set.has(a.professionalId))
  }, [appointments, selectedProfessionalIds])

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    for (const d of weekDays) {
      map[formatDateKey(d)] = []
    }
    for (const a of filteredAppointments) {
      const key = formatDateKey(new Date(a.scheduledDate))
      if (map[key]) map[key].push(a)
    }
    for (const key of Object.keys(map)) {
      map[key].sort((x, y) => new Date(x.scheduledDate).getTime() - new Date(y.scheduledDate).getTime())
    }
    return map
  }, [filteredAppointments, weekDays])

  const goPrevWeek = () => {
    const next = new Date(weekStart)
    next.setDate(next.getDate() - 7)
    setWeekStart(next)
  }

  const goNextWeek = () => {
    const next = new Date(weekStart)
    next.setDate(next.getDate() + 7)
    setWeekStart(next)
  }

  const goToday = () => {
    setWeekStart(getMondayOfWeek(new Date()))
  }

  const locale = i18n.language === 'es' ? 'es' : 'en'

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />

      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-[var(--text-primary)]">
            <Calendar size={28} className="text-[var(--color-primary)]" />
            <div>
              <h2 className="text-lg font-semibold">{t('supervision.calendar.title')}</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('supervision.calendar.description')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              {t('supervision.calendar.filterByPsychologist')}:
            </label>
            <select
              value={selectedProfessionalIds.length === 0 ? '' : selectedProfessionalIds[0]}
              onChange={(e) => {
                const v = e.target.value
                setSelectedProfessionalIds(v ? [v] : [])
              }}
              className="glass-input min-w-[180px] rounded-lg px-3 py-2 text-sm"
            >
              <option value="">{t('supervision.calendar.allPsychologists')}</option>
              {psychologists.filter((p) => p.isActive).map((p) => (
                <option key={p.id} value={p.id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
            <Link
              to="/appointments/new?department=psychology"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus size={18} />
              {t('supervision.calendar.newAppointment')}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrevWeek}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronLeft size={20} />
            {t('supervision.calendar.prevWeek')}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text-primary)]">
              {formatWeekLabel(weekStart, locale)}
            </span>
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              {t('supervision.calendar.today')}
            </button>
          </div>
          <button
            type="button"
            onClick={goNextWeek}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            {t('supervision.calendar.nextWeek')}
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[700px] grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const key = formatDateKey(day)
              const dayAppointments = appointmentsByDay[key] ?? []
              const dayLabel = day.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
              return (
                <div
                  key={key}
                  className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--glass-bg)]/50"
                >
                  <div className="border-b border-[var(--border)] px-2 py-2 text-center text-sm font-medium text-[var(--text-primary)]">
                    {dayLabel}
                  </div>
                  <div className="flex min-h-[120px] flex-1 flex-col gap-1.5 p-2">
                    {dayAppointments.length === 0 && (
                      <p className="py-4 text-center text-xs text-[var(--text-muted)]">—</p>
                    )}
                    {dayAppointments.map((a) => (
                      <Link
                        key={a.id}
                        to={`/appointments/${a.id}`}
                        className="block rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] p-2 text-left transition-colors hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5"
                      >
                        <p className="text-xs font-medium text-[var(--color-primary)]">
                          {formatTime(a.scheduledDate)}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-primary)]">
                          {fullName(a.patient.user)}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {fullName(a.professional)}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          {a.durationMinutes} min · {STATUS_KEYS[a.status] ? t(`appointments.${STATUS_KEYS[a.status]}`) : a.status}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {!loading && filteredAppointments.length === 0 && (
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            {t('supervision.calendar.noAppointmentsInWeek')}
          </p>
        )}
      </GlassCard>
    </div>
  )
}
