import { useRef, useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { EventInput, DatesSetArg, EventClickArg } from '@fullcalendar/core'
import { GlassCard } from '@/components/atoms/GlassCard'
import { CalendarDays, Calendar, PartyPopper, Building2, X, Mail, MessageCircle, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CALENDAR_COLORS } from '@/utils/calendarActivities'
import { CALENDAR_EVENT_TYPES } from '@/types/calendar'

export interface CalendarEventDetail {
  type: string
  title: string
  resourceId?: string
  description?: string
  /** Para cumpleaños */
  email?: string
  phone?: string
  patientName?: string
  /** Para festivo */
  label?: string
}

export interface WeeklyActivitiesCalendarProps {
  /** Título del encabezado */
  title: string
  /** Eventos en formato FullCalendar */
  events: EventInput[]
  /** Rango visible (para sincronizar con datos) */
  initialDate?: Date
  /** Al cambiar de semana (navegación prev/next) */
  onDatesSet?: (start: Date, end: Date) => void
  /** Cargando */
  loading?: boolean
}

export function WeeklyActivitiesCalendar({
  title,
  events,
  initialDate = new Date(),
  onDatesSet,
  loading = false,
}: WeeklyActivitiesCalendarProps) {
  const { t } = useTranslation()
  const calendarRef = useRef<FullCalendar>(null)
  const [detailModal, setDetailModal] = useState<CalendarEventDetail | null>(null)

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      onDatesSet?.(arg.start, arg.end)
    },
    [onDatesSet]
  )

  const handleEventClick = useCallback((arg: EventClickArg) => {
    arg.jsEvent.preventDefault()
    const ev = arg.event
    const ext = ev.extendedProps as Record<string, unknown>
    const type = (ext.type as string) || ''
    setDetailModal({
      type,
      title: ev.title,
      resourceId: ext.resourceId as string | undefined,
      description: ext.description as string | undefined,
      email: ext.email as string | undefined,
      phone: ext.phone as string | undefined,
      patientName: ext.patientName as string | undefined,
      label: ext.label as string | undefined,
    })
  }, [])

  const initialDateKey = initialDate ? initialDate.toISOString().slice(0, 10) : ''
  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (api && initialDateKey) api.gotoDate(initialDateKey)
  }, [initialDateKey])

  return (
    <GlassCard className="overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--border)] bg-[var(--bg)]/40 px-4 py-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
          <CalendarDays className="h-5 w-5 text-[var(--color-primary)]" aria-hidden />
          {title}
        </h2>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="flex h-[400px] items-center justify-center text-[var(--text-muted)]">
            Cargando…
          </div>
        ) : (
          <>
          <div className="weekly-activities-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin]}
              initialView="timeGridWeek"
              initialDate={initialDate.toISOString().slice(0, 10)}
              locale="es"
              firstDay={1}
              // Mostrar el día completo para que se vean citas fuera de horario "típico".
              slotMinTime="00:00:00"
              slotMaxTime="23:59:00"
              slotDuration="00:30:00"
              allDaySlot={true}
              height={500}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              buttonText={{
                today: 'Hoy',
                week: 'Semana',
              }}
              events={events}
              datesSet={handleDatesSet}
              eventClick={handleEventClick}
              eventDisplay="block"
              dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.APPOINTMENT] }} />
              <Calendar className="h-3.5 w-3.5" /> Citas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.MEETING] }} />
              <Building2 className="h-3.5 w-3.5" /> Reuniones
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.HOLIDAY] }} />
              <CalendarDays className="h-3.5 w-3.5" /> Festivos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CALENDAR_COLORS[CALENDAR_EVENT_TYPES.BIRTHDAY] }} />
              <PartyPopper className="h-3.5 w-3.5" /> Cumpleaños
            </span>
          </div>
          </>
        )}
      </div>

      {detailModal && (
        <div
          className="calendar-event-detail-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-event-modal-title"
          onClick={() => setDetailModal(null)}
        >
          <div
            className="calendar-event-detail-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-event-detail-modal-header">
              <div
                className="calendar-event-detail-modal-icon-badge"
                style={{
                  backgroundColor: `${(CALENDAR_COLORS as Record<string, string>)[detailModal.type] ?? 'var(--color-primary)'}20`,
                }}
                aria-hidden
              >
                {detailModal.type === CALENDAR_EVENT_TYPES.APPOINTMENT && <Calendar className="h-6 w-6" style={{ color: (CALENDAR_COLORS as Record<string, string>)[CALENDAR_EVENT_TYPES.APPOINTMENT] }} />}
                {detailModal.type === CALENDAR_EVENT_TYPES.BIRTHDAY && <PartyPopper className="h-6 w-6" style={{ color: (CALENDAR_COLORS as Record<string, string>)[CALENDAR_EVENT_TYPES.BIRTHDAY] }} />}
                {detailModal.type === CALENDAR_EVENT_TYPES.HOLIDAY && <CalendarDays className="h-6 w-6" style={{ color: (CALENDAR_COLORS as Record<string, string>)[CALENDAR_EVENT_TYPES.HOLIDAY] }} />}
                {detailModal.type === CALENDAR_EVENT_TYPES.MEETING && <Building2 className="h-6 w-6" style={{ color: (CALENDAR_COLORS as Record<string, string>)[CALENDAR_EVENT_TYPES.MEETING] }} />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="calendar-event-modal-title" className="text-lg font-semibold text-[var(--text-primary)] truncate">
                  {detailModal.title}
                </h2>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                  {detailModal.type === CALENDAR_EVENT_TYPES.APPOINTMENT && t('calendar.eventModal.typeAppointment')}
                  {detailModal.type === CALENDAR_EVENT_TYPES.BIRTHDAY && t('calendar.eventModal.typeBirthday')}
                  {detailModal.type === CALENDAR_EVENT_TYPES.HOLIDAY && t('calendar.eventModal.typeHoliday')}
                  {detailModal.type === CALENDAR_EVENT_TYPES.MEETING && t('calendar.eventModal.typeMeeting')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="calendar-event-detail-modal-close"
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="calendar-event-detail-modal-body">
              {detailModal.type === CALENDAR_EVENT_TYPES.APPOINTMENT && (
                <div className="space-y-3">
                  {detailModal.description && (
                    <div className="calendar-event-detail-modal-item flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg)] text-[var(--text-muted)]" aria-hidden>
                        <Calendar size={18} />
                      </span>
                      <p className="text-sm text-[var(--text-secondary)] pt-0.5">{detailModal.description}</p>
                    </div>
                  )}
                  {detailModal.resourceId && (
                    <div className="calendar-event-detail-modal-item">
                      <Link
                        to={`/appointments/${detailModal.resourceId}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/10"
                      >
                        <ExternalLink size={18} />
                        {t('calendar.eventModal.viewAppointment')}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {detailModal.type === CALENDAR_EVENT_TYPES.BIRTHDAY && (
                <div className="space-y-3">
                  <div className="calendar-event-detail-modal-item flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg)] text-[var(--text-muted)]" aria-hidden>
                      <PartyPopper size={18} />
                    </span>
                    <p className="text-sm text-[var(--text-secondary)] pt-0.5">
                      {t('calendar.eventModal.birthdayGreeting')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detailModal.email && (
                      <a
                        href={`mailto:${detailModal.email}`}
                        className="calendar-event-detail-modal-item inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--color-primary)]/50 hover:scale-[1.02]"
                      >
                        <Mail size={18} />
                        {t('calendar.eventModal.sendEmail')}
                      </a>
                    )}
                    {detailModal.phone && (
                      <a
                        href={`https://wa.me/52${detailModal.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="calendar-event-detail-modal-item inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--color-primary)]/50 hover:scale-[1.02]"
                      >
                        <MessageCircle size={18} />
                        WhatsApp
                      </a>
                    )}
                    {!detailModal.email && !detailModal.phone && (
                      <p className="text-sm text-[var(--text-muted)]">{t('calendar.eventModal.noContact')}</p>
                    )}
                  </div>
                </div>
              )}

              {detailModal.type === CALENDAR_EVENT_TYPES.HOLIDAY && (
                <div className="calendar-event-detail-modal-item flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg)] text-[var(--text-muted)]" aria-hidden>
                    <CalendarDays size={18} />
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] pt-0.5">
                    {t('calendar.eventModal.holidayDetail', { name: detailModal.label || detailModal.title })}
                  </p>
                </div>
              )}

              {detailModal.type === CALENDAR_EVENT_TYPES.MEETING && (
                <div className="calendar-event-detail-modal-item flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg)] text-[var(--text-muted)]" aria-hidden>
                    <Building2 size={18} />
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] pt-0.5">
                    {detailModal.description || t('calendar.eventModal.meetingDetail')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
