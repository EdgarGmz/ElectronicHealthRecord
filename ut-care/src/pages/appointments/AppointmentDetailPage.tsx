import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Mail,
  Stethoscope,
  UserCircle,
} from 'lucide-react'
import { EmailLink } from '@/components/atoms/EmailLink'
import { PhoneWhatsAppLink } from '@/components/atoms/PhoneWhatsAppLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getAppointmentById } from '@/services/appointment.service'
import type { Appointment } from '@/types/appointment'
import { APPOINTMENT_STATUS, DEPARTMENT_KEYS } from '@/types/appointment'
import { getStatusBadgeClass } from '@/utils/tableRowColors'

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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getAppointmentById(id).then(setAppointment).catch(() => setError(t('common.error'))).finally(() => setLoading(false))
  }, [id, t])

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

          {appointment.notes && (
            <GlassCard>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <FileText size={18} className="text-[var(--color-primary)]" aria-hidden />
                {t('appointments.notes')}
              </h2>
              <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{appointment.notes}</p>
            </GlassCard>
          )}

          {appointment.cancellationReason && (
            <GlassCard className="border-[var(--color-error)]/30 bg-[var(--color-error)]/5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-error)]">
                <AlertCircle size={18} aria-hidden />
                {t('appointments.cancellationReason')}
              </h2>
              <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{appointment.cancellationReason}</p>
            </GlassCard>
          )}
        </>
      )}
    </div>
  )
}
