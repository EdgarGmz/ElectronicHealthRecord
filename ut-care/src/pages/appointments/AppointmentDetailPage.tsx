import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  User,
  FileText,
  AlertCircle,
  Mail,
  PlayCircle,
  Stethoscope,
  UserCircle,
  X,
} from 'lucide-react'
import { EmailLink } from '@/components/atoms/EmailLink'
import { PhoneWhatsAppLink } from '@/components/atoms/PhoneWhatsAppLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'
import { cancelAppointment, getAppointmentById, rescheduleAppointment } from '@/services/appointment.service'
import { getTherapySessions } from '@/services/therapy-session.service'
import type { Appointment } from '@/types/appointment'
import { APPOINTMENT_STATUS, DEPARTMENT_KEYS } from '@/types/appointment'
import { getStatusBadgeClass } from '@/utils/tableRowColors'
import type { TherapySession } from '@/types/therapy-session'

const actionButtonClass =
  'inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/15 px-2.5 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/25'

const STATUS_KEYS: Record<string, string> = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'statusScheduled',
  [APPOINTMENT_STATUS.CONFIRMED]: 'statusConfirmed',
  [APPOINTMENT_STATUS.COMPLETED]: 'statusCompleted',
  [APPOINTMENT_STATUS.CANCELLED]: 'statusCancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'statusNoShow',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  [APPOINTMENT_STATUS.COMPLETED]: 'success',
  [APPOINTMENT_STATUS.CANCELLED]: 'error',
  [APPOINTMENT_STATUS.NO_SHOW]: 'error',
  [APPOINTMENT_STATUS.SCHEDULED]: 'warning',
  [APPOINTMENT_STATUS.CONFIRMED]: 'warning',
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const canStartCancelReschedule = role === ROLES.PSICOLOGO
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelModalError, setCancelModalError] = useState<string | null>(null)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [rescheduleDateTime, setRescheduleDateTime] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [rescheduleModalError, setRescheduleModalError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [therapySession, setTherapySession] = useState<TherapySession | null>(null)
  const [therapyLoading, setTherapyLoading] = useState(false)

  const toDateTimeLocalValue = (iso: string): string => {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day}T${hh}:${mm}`
  }

  const refreshAppointment = async () => {
    if (!id) return
    const a = await getAppointmentById(id)
    setAppointment(a)
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getAppointmentById(id)
      .then(setAppointment)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  useEffect(() => {
    const run = async () => {
      if (!appointment || appointment.status !== APPOINTMENT_STATUS.COMPLETED) return
      setTherapyLoading(true)
      try {
        const day = appointment.scheduledDate.slice(0, 10)
        const res = await getTherapySessions({
          page: 1,
          limit: 20,
          patientId: appointment.patientId,
          therapistId: appointment.professionalId,
          dateFrom: day,
          dateTo: day,
        })
        const target = new Date(appointment.scheduledDate).getTime()
        const best = res.sessions
          .map((s) => ({ s, diff: Math.abs(new Date(s.sessionDate).getTime() - target) }))
          .sort((a, b) => a.diff - b.diff)[0]?.s
        setTherapySession(best ?? null)
      } catch {
        setTherapySession(null)
      } finally {
        setTherapyLoading(false)
      }
    }
    void run()
  }, [appointment])

  const openCancelModal = () => {
    setCancelReason('')
    setCancelModalError(null)
    setCancelModalOpen(true)
  }

  const openRescheduleModal = () => {
    if (!appointment) return
    setRescheduleReason('')
    setRescheduleModalError(null)
    setRescheduleDateTime(toDateTimeLocalValue(appointment.scheduledDate))
    setRescheduleModalOpen(true)
  }

  const patientName = appointment ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`.trim() : ''
  const professionalName = appointment ? `${appointment.professional.firstName} ${appointment.professional.lastName}`.trim() : ''
  const statusLabel = appointment && STATUS_KEYS[appointment.status] ? t(`appointments.${STATUS_KEYS[appointment.status]}`) : appointment?.status ?? ''
  const statusVariant = appointment ? (STATUS_VARIANT[appointment.status] ?? 'warning') : 'warning'
  const departmentLabel = appointment && DEPARTMENT_KEYS[appointment.department] ? t(`appointments.${DEPARTMENT_KEYS[appointment.department]}`) : appointment?.department ?? ''

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('appointments.noAppointments')} onClose={() => setError(null)} />
      <Link
        to="/appointments"
        className="inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:underline"
      >
        <ArrowLeft size={18} aria-hidden />
        {t('appointments.list')}
      </Link>

      {!appointment && !loading && (
        <GlassCard>
          <p className="text-[var(--text-secondary)]">{t('appointments.noAppointments')}</p>
        </GlassCard>
      )}

      {appointment && (
        <>
          <GlassCard className="border-[var(--color-primary)]/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
                  <Calendar className="text-[var(--color-primary)]" size={28} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    {formatDateShort(appointment.scheduledDate)}
                  </h1>
                  <p className="mt-1 text-[var(--text-secondary)]">
                    {new Date(appointment.scheduledDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    {appointment.durationMinutes} {t('appointments.minutes')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={getStatusBadgeClass(statusVariant)}>{statusLabel}</span>
                    {appointment.appointmentType && (
                      <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                        {appointment.appointmentType}
                      </span>
                    )}
                    {departmentLabel && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                        <Stethoscope size={12} />
                        {departmentLabel}
                      </span>
                    )}
                  </div>

                  {canStartCancelReschedule &&
                    (appointment.status === APPOINTMENT_STATUS.SCHEDULED || appointment.status === APPOINTMENT_STATUS.CONFIRMED) && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link
                          to={`/sessions/new?patientId=${encodeURIComponent(appointment.patient.id)}&appointmentId=${encodeURIComponent(appointment.id)}`}
                          className={actionButtonClass}
                        >
                          <PlayCircle size={16} aria-hidden />
                          {t('dashboard.psychologist.start', 'Iniciar')}
                        </Link>
                        <button type="button" className={actionButtonClass} onClick={openCancelModal}>
                          <X size={16} aria-hidden />
                          {t('sessions.cancel', 'Cancelar')}
                        </button>
                        <button type="button" className={actionButtonClass} onClick={openRescheduleModal}>
                          <CalendarPlus size={16} aria-hidden />
                          {t('sessions.reschedule', 'Reagendar')}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <User size={18} className="text-[var(--color-primary)]" aria-hidden />
                {t('appointments.patient')}
              </h2>
              <Link
                to={`/patients/${appointment.patient.id}`}
                className="block font-medium text-[var(--color-primary)] hover:underline"
              >
                {patientName}
              </Link>
              <div className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
                {appointment.patient.user.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
                    <EmailLink email={appointment.patient.user.email} />
                  </p>
                )}
                {appointment.patient.user.phone && (
                  <p className="flex items-center gap-2">
                    <PhoneWhatsAppLink phone={appointment.patient.user.phone} />
                  </p>
                )}
              </div>
              <Link
                to={`/patients/${appointment.patient.id}/expedient`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                <FileText size={16} aria-hidden />
                {t('patients.viewRecord')}
              </Link>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <UserCircle size={18} className="text-[var(--color-primary)]" aria-hidden />
                {t('appointments.professional')}
              </h2>
              <p className="font-medium text-[var(--text-primary)]">{professionalName}</p>
              {appointment.professional.email && (
                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Mail size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
                  <EmailLink email={appointment.professional.email} />
                </p>
              )}
              {appointment.createdByUser != null && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {t('expedient.createdBy')}: {appointment.createdByUser.firstName} {appointment.createdByUser.lastName}
                </p>
              )}
            </GlassCard>
          </div>

          {appointment.status === APPOINTMENT_STATUS.SCHEDULED && appointment.notes && (
            <GlassCard>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <FileText size={18} className="text-[var(--color-primary)]" aria-hidden />
                {t('appointments.notes')}
              </h2>
              <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{appointment.notes}</p>
            </GlassCard>
          )}

          {appointment.status === APPOINTMENT_STATUS.CANCELLED && appointment.cancellationReason && (
            <GlassCard className="border-[var(--color-error)]/30 bg-[var(--color-error)]/5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-error)]">
                <AlertCircle size={18} aria-hidden />
                {t('appointments.cancellationReason')}
              </h2>
              <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{appointment.cancellationReason}</p>
            </GlassCard>
          )}

          {appointment.status === APPOINTMENT_STATUS.COMPLETED && (
            <GlassCard className="border-[var(--color-primary)]/20">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <FileText size={18} />
                {t('sessions.sessionDetail', 'Detalles de sesión')}
              </h2>
              {therapyLoading && (
                <p className="text-sm text-[var(--text-secondary)]">{t('common.loading')}</p>
              )}
              {!therapyLoading && therapySession && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {t('sessions.sessionNumber', 'Sesión')} #{therapySession.sessionNumber}
                    </p>
                    <p className="mt-1 text-[var(--text-secondary)]">
                      {new Date(therapySession.sessionDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} ·{' '}
                      {therapySession.sessionDuration} {t('sessions.minutes', 'min')}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    {therapySession.mood ? (
                      <p className="whitespace-pre-wrap text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{t('sessions.mood', 'Estado de ánimo')}: </span>
                        {therapySession.mood}
                      </p>
                    ) : (
                      <p className="text-[var(--text-muted)]">—</p>
                    )}
                  </div>
                  {therapySession.evolutionNotes && (
                    <div className="sm:col-span-2">
                      <p className="whitespace-pre-wrap text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{t('sessions.evolutionNotes', 'Notas de evolución')}: </span>
                        {therapySession.evolutionNotes}
                      </p>
                    </div>
                  )}
                  {therapySession.patientProgress && (
                    <div className="sm:col-span-2">
                      <p className="whitespace-pre-wrap text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{t('sessions.patientProgress', 'Progreso del paciente')}: </span>
                        {therapySession.patientProgress}
                      </p>
                    </div>
                  )}
                  {therapySession.assignedTasks && (
                    <div className="sm:col-span-2">
                      <p className="whitespace-pre-wrap text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{t('sessions.assignedTasks', 'Tareas asignadas')}: </span>
                        {therapySession.assignedTasks}
                      </p>
                    </div>
                  )}
                  {therapySession.observations && (
                    <div className="sm:col-span-2">
                      <p className="whitespace-pre-wrap text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{t('sessions.observations', 'Observaciones')}: </span>
                        {therapySession.observations}
                      </p>
                    </div>
                  )}
                  {therapySession.nextSessionPlan && (
                    <div className="sm:col-span-2">
                      <p className="whitespace-pre-wrap text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{t('sessions.nextSessionPlan', 'Plan próxima sesión')}: </span>
                        {therapySession.nextSessionPlan}
                      </p>
                    </div>
                  )}
                  {therapySession.therapist && (
                    <div className="sm:col-span-2">
                      <p className="text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{t('sessions.therapist', 'Terapeuta')}: </span>
                        {therapySession.therapist.firstName} {therapySession.therapist.lastName}
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2 pt-2">
                    <Link to={`/sessions/${therapySession.id}`} className="text-sm text-[var(--color-primary)] hover:underline">
                      {t('sessions.viewDetail', 'Ver sesión')} →
                    </Link>
                  </div>
                </div>
              )}
              {!therapyLoading && !therapySession && (
                <p className="text-sm text-[var(--text-muted)]">{t('sessions.noSessions', 'No se pudo localizar la sesión de terapia')}. </p>
              )}
            </GlassCard>
          )}
        </>
      )}

      <ConfirmModal
        open={cancelModalOpen}
        onClose={() => !actionLoading && setCancelModalOpen(false)}
        onConfirm={() => {
          if (!appointment) return
          void (async () => {
            const reason = cancelReason.trim()
            if (!reason) {
              setCancelModalError(t('appointments.cancellationReason', 'Motivo de cancelación') + ' es requerido')
              return
            }
            setActionLoading(true)
            try {
              await cancelAppointment(appointment.id, reason)
              setCancelModalOpen(false)
              await refreshAppointment()
            } catch {
              setCancelModalError(t('common.error', 'Error'))
            } finally {
              setActionLoading(false)
            }
          })()
        }}
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
        onClose={() => !actionLoading && setRescheduleModalOpen(false)}
        onConfirm={() => {
          if (!appointment) return
          void (async () => {
            const reason = rescheduleReason.trim()
            if (!rescheduleDateTime) {
              setRescheduleModalError(t('sessions.newSessionDate', 'Nueva fecha es requerida'))
              return
            }
            if (!reason) {
              setRescheduleModalError(t('sessions.rescheduleReason', 'Motivo de reagendar') + ' es requerido')
              return
            }
            setActionLoading(true)
            try {
              const iso = new Date(rescheduleDateTime).toISOString()
              await rescheduleAppointment(appointment.id, iso, reason)
              setRescheduleModalOpen(false)
              await refreshAppointment()
            } catch {
              setRescheduleModalError(t('common.error', 'Error'))
            } finally {
              setActionLoading(false)
            }
          })()
        }}
        confirming={actionLoading}
        title={t('sessions.reschedule', 'Reagendar cita')}
        message={t('sessions.rescheduleConfirm', 'Ingresa la nueva fecha/hora y el motivo')}
        confirmLabel={t('sessions.confirmReschedule', 'Confirmar')}
        cancelLabel={t('common.close')}
        detail={
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                {t('sessions.newSessionDate', 'Nueva fecha')}
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
    </div>
  )
}
