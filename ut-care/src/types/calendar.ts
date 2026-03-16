/**
 * Tipos de actividad para el calendario semanal del psicólogo.
 * Estructura compatible con FullCalendar EventInput y con el JSON de ejemplo.
 */
export const CALENDAR_EVENT_TYPES = {
  APPOINTMENT: 'appointment',
  MEETING: 'meeting',
  HOLIDAY: 'holiday',
  BIRTHDAY: 'birthday',
} as const

export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[keyof typeof CALENDAR_EVENT_TYPES]

/** Actividad para el calendario: título, inicio, fin, tipo y metadatos opcionales */
export interface CalendarActivity {
  id: string
  title: string
  start: string
  end: string
  type: CalendarEventType
  /** Color de fondo (hex o var) */
  color?: string
  /** Descripción o subtítulo */
  description?: string
  /** ID externo (ej. appointmentId, patientId) */
  resourceId?: string
}

/**
 * Ejemplo de JSON de actividades (para documentación o mocks):
 *
 * [
 *   {
 *     "id": "evt-1",
 *     "title": "Cita con María García",
 *     "start": "2025-03-17T09:00:00",
 *     "end": "2025-03-17T09:50:00",
 *     "type": "appointment",
 *     "description": "Primera sesión"
 *   },
 *   {
 *     "id": "evt-2",
 *     "title": "Reunión de equipo",
 *     "start": "2025-03-18T10:00:00",
 *     "end": "2025-03-18T11:00:00",
 *     "type": "meeting"
 *   },
 *   {
 *     "id": "evt-3",
 *     "title": "Día de la mujer",
 *     "start": "2025-03-08T00:00:00",
 *     "end": "2025-03-08T23:59:59",
 *     "type": "holiday"
 *   },
 *   {
 *     "id": "evt-4",
 *     "title": "Cumpleaños: Juan Pérez",
 *     "start": "2025-03-20T08:00:00",
 *     "end": "2025-03-20T08:30:00",
 *     "type": "birthday"
 *   }
 * ]
 */
