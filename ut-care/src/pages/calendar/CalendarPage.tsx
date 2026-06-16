import { useEffect, useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'
import { GlassCard } from '@/components/atoms/GlassCard'
import { WeeklyActivitiesCalendar } from '@/components/dashboard/WeeklyActivitiesCalendar'
import { getAppointments } from '@/services/appointment.service'
import { getPatients } from '@/services/patient.service'
import {
  getWeekBoundsForDate,
  appointmentsToEvents,
  birthdaysToEvents,
  holidaysToEvents,
} from '@/utils/calendarActivities'

export function CalendarPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const role = user?.role?.toLowerCase().trim()

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    )
  }

  if (role === ROLES.PSICOLOGO) {
    return <PsychologistCalendarView />
  }

  return (
    <GlassCard>
      <p className="text-[var(--text-secondary)]">
        {t('calendar.noAccess')}
      </p>
    </GlassCard>
  )
}

function PsychologistCalendarView() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [calendarWeekStart, setCalendarWeekStart] = useState<Date>(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(d)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    return start
  })
  const [weekAppointments, setWeekAppointments] = useState<Awaited<ReturnType<typeof getAppointments>>['appointments']>([])
  const [patients, setPatients] = useState<Awaited<ReturnType<typeof getPatients>>['patients']>([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const fetchingForKeyRef = useRef<string | null>(null)
  const hasLoadedOnceRef = useRef(false)

  const weekBounds = useMemo(
    () => getWeekBoundsForDate(calendarWeekStart),
    [calendarWeekStart]
  )
  const weekBoundsKey = `${weekBounds.start.toISOString().slice(0, 10)}`
  const calendarEvents = useMemo(() => {
    const apptEvents = appointmentsToEvents(weekAppointments, weekBounds.start, weekBounds.end)
    const bdayEvents = birthdaysToEvents(patients, weekBounds.start, weekBounds.end)
    const holidayEvents = holidaysToEvents(weekBounds.start, weekBounds.end)
    return [...apptEvents, ...bdayEvents, ...holidayEvents]
  }, [weekAppointments, patients, weekBounds.start, weekBounds.end])

  useEffect(() => {
    if (!user?.id) return
    getPatients({ limit: 300 }).then((r) => setPatients(r.patients)).catch(() => setPatients([]))
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    if (fetchingForKeyRef.current === weekBoundsKey) return
    fetchingForKeyRef.current = weekBoundsKey
    let cancelled = false
    if (!hasLoadedOnceRef.current) setCalendarLoading(true)
    getAppointments({
      page: 1,
      limit: 100,
      startDate: weekBounds.start.toISOString(),
      endDate: weekBounds.end.toISOString(),
    })
      .then((r) => {
        if (!cancelled) setWeekAppointments(r.appointments)
      })
      .catch(() => {
        if (!cancelled) setWeekAppointments([])
      })
      .finally(() => {
        if (!cancelled) hasLoadedOnceRef.current = true
        setCalendarLoading(false)
        if (fetchingForKeyRef.current === weekBoundsKey) fetchingForKeyRef.current = null
      })
    return () => { cancelled = true }
  }, [user?.id, weekBoundsKey])

  return (
    <div className="min-h-[500px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Calendar className="text-[var(--color-primary)]" size={28} />
          {t('nav.calendar')}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {t('calendar.psychologistDescription')}
        </p>
      </div>
      <WeeklyActivitiesCalendar
        title={t('calendar.weeklyActivities')}
        events={calendarEvents}
        initialDate={calendarWeekStart}
        onDatesSet={(start) => {
          const newKey = start.toISOString().slice(0, 10)
          setCalendarWeekStart((prev) => {
            const prevKey = prev.toISOString().slice(0, 10)
            return prevKey === newKey ? prev : start
          })
        }}
        loading={calendarLoading}
      />
    </div>
  )
}
