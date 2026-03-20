import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, User, BarChart3, Plus } from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { EmailLink } from '@/components/atoms/EmailLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'
import { getTherapySessionById, getTherapySessions } from '@/services/therapy-session.service'
import { getAppointments } from '@/services/appointment.service'
import { cancelTherapySession, rescheduleTherapySession } from '@/services/therapy-session.service'
import { getMoods } from '@/services/mood.service'
import { APPOINTMENT_STATUS } from '@/types/appointment'
import type { TherapySession } from '@/types/therapy-session'
import type { Mood } from '@/types/mood'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
}

function toDateInputValue(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function resolveMoodCodes(codesStr: string, moods: Mood[]): { emoji: string; name: string; code: string }[] {
  const codes = codesStr ? codesStr.split(',').map((c) => c.trim()).filter(Boolean) : []
  const byCode = new Map(moods.map((m) => [m.code, m]))
  return codes.map((code) => {
    const m = byCode.get(code)
    return m ? { emoji: m.emoji, name: m.name, code: m.code } : { emoji: '•', name: code, code }
  })
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const role = useAuthStore((s) => s.user?.role)
  const canCancelOrReschedule = role === ROLES.PSICOLOGO
  const [session, setSession] = useState<TherapySession | null>(null)
  const [isAppointmentCompleted, setIsAppointmentCompleted] = useState(false)
  const [moods, setMoods] = useState<Mood[]>([])
  const [allSessions, setAllSessions] = useState<TherapySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getTherapySessionById(id).then(setSession).catch(() => setError(t('common.error'))).finally(() => setLoading(false))
  }, [id, t])

  useEffect(() => {
    getMoods().then(setMoods).catch(() => setMoods([]))
  }, [])

  useEffect(() => {
    if (!session?.psychologyRecordId) return
    getTherapySessions({ psychologyRecordId: session.psychologyRecordId, limit: 200 })
      .then((res) => setAllSessions(res.sessions))
      .catch(() => setAllSessions([]))
  }, [session?.psychologyRecordId])

  // Si la sesión fue creada a partir de una cita que ya fue marcada como "completed",
  // ocultamos Cancelar/Reagendar (aunque therapySession.status siga en "scheduled").
  useEffect(() => {
    if (!session) return
    const patientId = session.psychologyRecord.medicalRecord.patient.id
    const therapistId = session.therapistId

    if (!patientId || !therapistId) return

    const day = new Date(session.sessionDate)
    const targetMs = day.getTime()
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    void getAppointments({
      page: 1,
      limit: 50,
      patientId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    })
      .then((r) => {
        const sameTherapist = r.appointments.filter((a) => a.professionalId === therapistId)
        if (sameTherapist.length === 0) {
          setIsAppointmentCompleted(false)
          return
        }
        const best = sameTherapist
          .map((a) => ({ a, diff: Math.abs(new Date(a.scheduledDate).getTime() - targetMs) }))
          .sort((x, y) => x.diff - y.diff)[0]?.a
        setIsAppointmentCompleted(!!best && best.status === APPOINTMENT_STATUS.COMPLETED)
      })
      .catch(() => setIsAppointmentCompleted(false))
  }, [session])

  const patientName = session ? `${session.psychologyRecord.medicalRecord.patient.user.firstName} ${session.psychologyRecord.medicalRecord.patient.user.lastName}`.trim() : ''
  const therapistName = session ? `${session.therapist.firstName} ${session.therapist.lastName}`.trim() : ''

  const evolutionChartData = useMemo(() => {
    if (allSessions.length === 0 || moods.length === 0) return []
    const byCode = new Map(moods.map((m) => [m.code, m]))
    const sorted = [...allSessions].sort((a, b) => a.sessionNumber - b.sessionNumber)
    return sorted.map((s) => {
      const codes = s.mood ? s.mood.split(',').map((c) => c.trim()).filter(Boolean) : []
      let positive = 0
      const names: string[] = []
      codes.forEach((code) => {
        const m = byCode.get(code)
        if (m) {
          names.push(`${m.emoji} ${m.name}`)
          if (m.category === 'positive') positive += 1
        } else names.push(code)
      })
      return {
        sessionNumber: s.sessionNumber,
        sessionLabel: `${t('sessions.sessionNumber')} ${s.sessionNumber}`,
        total: codes.length,
        positive,
        other: codes.length - positive,
        moodSummary: names.join(', ') || '—',
      }
    })
  }, [allSessions, moods, t])

  const sessionMoodItems = useMemo(
    () => (session && session.mood ? resolveMoodCodes(session.mood, moods) : []),
    [session, moods]
  )

  const refreshSession = async () => {
    if (!id) return
    const refreshed = await getTherapySessionById(id)
    setSession(refreshed)
  }

  const openCancel = () => {
    setCancelReason('')
    setShowCancelModal(true)
  }

  const openReschedule = () => {
    if (!session?.sessionDate) return
    setRescheduleReason('')
    setRescheduleDate(toDateInputValue(session.sessionDate))
    setShowRescheduleModal(true)
  }

  const confirmCancel = async () => {
    if (!session?.id) return
    const reason = cancelReason.trim()
    if (!reason) {
      setError(t('sessions.cancelReasonRequired', 'Motivo de cancelación es requerido'))
      return
    }
    setActionLoading(true)
    try {
      await cancelTherapySession(session.id, reason)
      setShowCancelModal(false)
      await refreshSession()
    } catch {
      // keep modal open, error surfaced via generic ErrorModal
      setError(t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  const confirmReschedule = async () => {
    if (!session?.id) return
    const reason = rescheduleReason.trim()
    if (!rescheduleDate) {
      setError(t('sessions.newSessionDateRequired', 'Nueva fecha es requerida'))
      return
    }
    if (!reason) {
      setError(t('sessions.rescheduleReasonRequired', 'Motivo de reagendar es requerido'))
      return
    }
    setActionLoading(true)
    try {
      await rescheduleTherapySession(session.id, rescheduleDate, reason)
      setShowRescheduleModal(false)
      await refreshSession()
    } catch {
      setError(t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('sessions.noSessions')} onClose={() => setError(null)} />
      <div className="flex items-center justify-between gap-3">
        <Link to="/sessions" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
          <ArrowLeft size={18} />
          {t('sessions.list')}
        </Link>
        {session && (
          <Link to={`/sessions/new?psychologyRecordId=${encodeURIComponent(session.psychologyRecordId)}`}>
            <GlassButton type="button" variant="primary" className="inline-flex items-center gap-2">
              <Plus size={18} aria-hidden />
              {t('sessions.newSession')}
            </GlassButton>
          </Link>
        )}
      </div>
      {!session && !loading && (
        <GlassCard>
          <p className="text-[var(--text-secondary)]">{t('sessions.noSessions')}</p>
        </GlassCard>
      )}
      {session && (
      <>
      <GlassCard className="border-[var(--color-primary)]/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <FileText className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('sessions.sessionNumber')} {session.sessionNumber}</h1>
            <p className="mt-1 text-[var(--text-secondary)]">{formatDateTime(session.sessionDate)} · {session.sessionDuration} {t('sessions.minutes')}</p>
            {session.status && session.status !== 'scheduled' && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {session.status === 'cancelled'
                  ? t('sessions.statusCancelled', 'Cancelada')
                  : session.status === 'rescheduled'
                    ? t('sessions.statusRescheduled', 'Reagendada')
                    : session.status}
              </p>
            )}
            <div className="mt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{t('sessions.mood')}</p>
              {sessionMoodItems.length === 0 ? (
                <p className="mt-1 text-sm text-[var(--text-muted)]">—</p>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {sessionMoodItems.map((item) => (
                    <span
                      key={item.code}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--border)]/60 px-3 py-1 text-sm text-[var(--text-secondary)]"
                    >
                      <span aria-hidden>{item.emoji}</span>
                      <span>{item.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {canCancelOrReschedule && session.status !== 'cancelled' && session.status !== 'completed' && !isAppointmentCompleted && (
        <div className="flex flex-wrap items-center gap-3">
          <GlassButton
            type="button"
            variant="glass"
            onClick={openCancel}
            disabled={actionLoading || showCancelModal || showRescheduleModal}
          >
            {t('sessions.cancel', 'Cancelar')}
          </GlassButton>
          <GlassButton
            type="button"
            variant="glass"
            onClick={openReschedule}
            disabled={actionLoading || showCancelModal || showRescheduleModal}
          >
            {t('sessions.reschedule', 'Reagendar')}
          </GlassButton>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><User size={18} />{t('sessions.patient')}</h2>
          <p className="font-medium text-[var(--text-primary)]">{patientName}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
          <EmailLink email={session.psychologyRecord.medicalRecord.patient.user.email} />
        </p>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><User size={18} />{t('sessions.therapist')}</h2>
          <p className="font-medium text-[var(--text-primary)]">{therapistName}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
          <EmailLink email={session.therapist.email} />
        </p>
        </GlassCard>
      </div>

      {evolutionChartData.length > 0 && (
        <GlassCard className="rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
            <BarChart3 size={20} className="text-[var(--color-primary)]" />
            {t('sessions.evolutionChartTitle')}
          </h2>
          <p className="mb-4 text-sm text-[var(--text-muted)]">{t('sessions.evolutionChartDescription')}</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="sessionNumber"
                  type="number"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tick={{ fill: 'var(--text-muted)' }}
                />
                <YAxis stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0].payload as (typeof evolutionChartData)[0]
                    return (
                      <div className="rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] p-3 shadow-lg">
                        <p className="font-medium text-[var(--text-primary)]">{p.sessionLabel}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{t('sessions.evolutionChartTooltipMoods')}: {p.moodSummary}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {t('sessions.evolutionChartPositive')}: {p.positive} · {t('sessions.evolutionChartOther')}: {p.other}
                        </p>
                      </div>
                    )
                  }}
                />
                <Legend />
                <Scatter data={evolutionChartData} dataKey="positive" name={t('sessions.evolutionChartPositive')} fill="var(--color-success)" />
                <Scatter data={evolutionChartData} dataKey="other" name={t('sessions.evolutionChartOther')} fill="var(--color-primary)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {session.evolutionNotes && (
        <GlassCard>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><FileText size={18} />{t('sessions.evolutionNotes')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{session.evolutionNotes}</p>
        </GlassCard>
      )}
      {session.patientProgress && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('sessions.patientProgress')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{session.patientProgress}</p>
        </GlassCard>
      )}
      {session.assignedTasks && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('sessions.assignedTasks')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{session.assignedTasks}</p>
        </GlassCard>
      )}
      {session.observations && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('sessions.observations')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{session.observations}</p>
        </GlassCard>
      )}
      {session.nextSessionPlan && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('sessions.nextSessionPlan')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{session.nextSessionPlan}</p>
        </GlassCard>
      )}

      {session.status === 'cancelled' && session.cancellationReason && (
        <GlassCard className="border-[var(--color-error)]/20">
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
            {t('appointments.cancellationReason', 'Motivo de cancelación')}
          </h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{session.cancellationReason}</p>
        </GlassCard>
      )}

      {session.status === 'rescheduled' && session.rescheduleReason && (
        <GlassCard className="border-[var(--color-primary)]/20">
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
            {t('sessions.rescheduleReason', 'Motivo de reagendar')}
          </h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{session.rescheduleReason}</p>
        </GlassCard>
      )}
      </>
      )}

      <ConfirmModal
        open={showCancelModal}
        onClose={() => !actionLoading && setShowCancelModal(false)}
        onConfirm={() => void confirmCancel()}
        confirming={actionLoading}
        title={t('sessions.cancel', 'Cancelar sesión')}
        message={t('sessions.cancelConfirm', '¿Cancelar esta sesión?')}
        confirmLabel={t('sessions.confirmCancel', 'Confirmar')}
        cancelLabel={t('common.close')}
        detail={
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">
              {t('sessions.cancelReasonHint', 'Escribe el motivo de cancelación')}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              rows={4}
            />
          </div>
        }
        variant="danger"
      />

      <ConfirmModal
        open={showRescheduleModal}
        onClose={() => !actionLoading && setShowRescheduleModal(false)}
        onConfirm={() => void confirmReschedule()}
        confirming={actionLoading}
        title={t('sessions.reschedule', 'Reagendar sesión')}
        message={t('sessions.rescheduleConfirm', 'Ingresa el motivo y la nueva fecha de la sesión.')}
        confirmLabel={t('sessions.confirmReschedule', 'Confirmar')}
        cancelLabel={t('common.close')}
        detail={
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                {t('sessions.newSessionDate', 'Nueva fecha')}
              </label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                {t('sessions.rescheduleReason', 'Motivo de reagendar')}
              </label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-sm"
                rows={4}
              />
            </div>
          </div>
        }
      />
    </div>
  )
}
