import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { EmailLink } from '@/components/atoms/EmailLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getAppointmentById } from '@/services/appointment.service'
import type { Appointment } from '@/types/appointment'
import { APPOINTMENT_STATUS, DEPARTMENT_KEYS } from '@/types/appointment'

const STATUS_KEYS: Record<string, string> = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'statusScheduled',
  [APPOINTMENT_STATUS.CONFIRMED]: 'statusConfirmed',
  [APPOINTMENT_STATUS.COMPLETED]: 'statusCompleted',
  [APPOINTMENT_STATUS.CANCELLED]: 'statusCancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'statusNoShow',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
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

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('appointments.noAppointments')} onClose={() => setError(null)} />
      <Link to="/appointments" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
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
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <Calendar className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{formatDateTime(appointment.scheduledDate)}</h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              {appointment.durationMinutes} {t('appointments.minutes')} · {STATUS_KEYS[appointment.status] ? t(`appointments.${STATUS_KEYS[appointment.status]}`) : appointment.status}
            </p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <User size={18} />
            {t('appointments.patient')}
          </h2>
          <p className="font-medium text-[var(--text-primary)]">{patientName}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
          <EmailLink email={appointment.patient.user.email} />
        </p>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <User size={18} />
            {t('appointments.professional')}
          </h2>
          <p className="font-medium text-[var(--text-primary)]">{professionalName}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {DEPARTMENT_KEYS[appointment.department] ? t(`appointments.${DEPARTMENT_KEYS[appointment.department]}`) : appointment.department}
          </p>
        </GlassCard>
      </div>
      {appointment.notes && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('appointments.notes')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{appointment.notes}</p>
        </GlassCard>
      )}
      {appointment.cancellationReason && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--color-error)]">{t('appointments.cancellationReason')}</h2>
          <p className="text-[var(--text-secondary)]">{appointment.cancellationReason}</p>
        </GlassCard>
      )}
      </>
      )}
    </div>
  )
}
