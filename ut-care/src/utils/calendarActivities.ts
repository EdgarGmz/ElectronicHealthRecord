import type { EventInput } from '@fullcalendar/core'
import type { Appointment } from '@/types/appointment'
import type { Patient } from '@/types/patient'
import { CALENDAR_EVENT_TYPES } from '@/types/calendar'

/** Colores por tipo de actividad (diseño clínico, tonos suaves) */
export const CALENDAR_COLORS = {
  [CALENDAR_EVENT_TYPES.APPOINTMENT]: '#6366f1', // indigo
  [CALENDAR_EVENT_TYPES.MEETING]: '#0ea5e9',    // sky
  [CALENDAR_EVENT_TYPES.HOLIDAY]: '#64748b',     // slate
  [CALENDAR_EVENT_TYPES.BIRTHDAY]: '#a855f7',    // violet
} as const

/** Festivos (MM-DD) para marcar en el calendario */
const HOLIDAYS_MM_DD: { key: string; label: string }[] = [
  { key: '01-01', label: 'Año Nuevo' },
  { key: '02-05', label: 'Día de la Constitución' },
  { key: '03-21', label: 'Natalicio de Benito Juárez' },
  { key: '05-01', label: 'Día del Trabajo' },
  { key: '09-16', label: 'Día de la Independencia' },
  { key: '11-02', label: 'Día de Muertos' },
  { key: '11-20', label: 'Revolución Mexicana' },
  { key: '12-25', label: 'Navidad' },
  { key: '03-08', label: 'Día Internacional de la Mujer' },
]

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function isDateInWeek(d: Date, weekStart: Date, weekEnd: Date): boolean {
  const t = d.getTime()
  return t >= weekStart.getTime() && t <= weekEnd.getTime()
}

/** Convierte Appointment[] a EventInput[] para FullCalendar */
export function appointmentsToEvents(
  appointments: Appointment[],
  weekStart: Date,
  weekEnd: Date
): EventInput[] {
  return appointments
    .filter((a) => {
      const sd = new Date(a.scheduledDate)
      return isDateInWeek(sd, weekStart, weekEnd)
    })
    .map((a) => {
      const start = new Date(a.scheduledDate)
      const end = new Date(start.getTime() + (a.durationMinutes || 50) * 60 * 1000)
      const patientName = a.patient?.user
        ? `${a.patient.user.firstName} ${a.patient.user.lastName}`
        : 'Paciente'
      return {
        id: `appt-${a.id}`,
        title: patientName,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.APPOINTMENT],
        borderColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.APPOINTMENT],
        extendedProps: {
          type: CALENDAR_EVENT_TYPES.APPOINTMENT,
          resourceId: a.id,
          description: a.appointmentType || '',
        },
      }
    })
}

/** Genera eventos de cumpleaños para la semana a partir de pacientes */
export function birthdaysToEvents(
  patients: Patient[],
  weekStart: Date,
  weekEnd: Date
): EventInput[] {
  const events: EventInput[] = []
  const startYear = weekStart.getFullYear()
  for (const p of patients) {
    const dob = p.user?.dateOfBirth
    if (!dob) continue
    const d = new Date(dob)
    const thisYearBirthday = new Date(startYear, d.getMonth(), d.getDate(), 8, 0, 0)
    if (!isDateInWeek(thisYearBirthday, weekStart, weekEnd)) continue
    const name = p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Paciente'
    events.push({
      id: `bday-${p.id}-${thisYearBirthday.getTime()}`,
      title: `Cumpleaños: ${name}`,
      start: thisYearBirthday.toISOString(),
      end: new Date(thisYearBirthday.getTime() + 30 * 60 * 1000).toISOString(),
      backgroundColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.BIRTHDAY],
      borderColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.BIRTHDAY],
      extendedProps: {
        type: CALENDAR_EVENT_TYPES.BIRTHDAY,
        resourceId: p.id,
        patientName: name,
        email: p.user?.email ?? undefined,
        phone: p.user?.phone ?? undefined,
      },
    })
  }
  return events
}

/** Festivos que caen en la semana */
export function holidaysToEvents(weekStart: Date, weekEnd: Date): EventInput[] {
  const year = weekStart.getFullYear()
  const events: EventInput[] = []
  for (const h of HOLIDAYS_MM_DD) {
    const [m, d] = h.key.split('-').map(Number)
    const date = new Date(year, m - 1, d, 0, 0, 0)
    if (!isDateInWeek(date, weekStart, weekEnd)) continue
    const end = new Date(year, m - 1, d, 23, 59, 59)
    events.push({
      id: `holiday-${h.key}-${year}`,
      title: h.label,
      start: date.toISOString(),
      end: end.toISOString(),
      backgroundColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.HOLIDAY],
      borderColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.HOLIDAY],
      extendedProps: { type: CALENDAR_EVENT_TYPES.HOLIDAY, label: h.label },
      allDay: true,
    })
  }
  return events
}

/** Obtiene inicio y fin de la semana (lunes a domingo) que contiene la fecha */
export function getWeekBoundsForDate(date: Date): { start: Date; end: Date } {
  return getWeekBounds(date)
}
