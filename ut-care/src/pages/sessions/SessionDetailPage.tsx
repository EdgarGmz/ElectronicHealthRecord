import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, User } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getTherapySessionById } from '@/services/therapy-session.service'
import type { TherapySession } from '@/types/therapy-session'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [session, setSession] = useState<TherapySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getTherapySessionById(id).then(setSession).catch(() => setError(t('common.error'))).finally(() => setLoading(false))
  }, [id, t])

  const patientName = session ? `${session.psychologyRecord.medicalRecord.patient.user.firstName} ${session.psychologyRecord.medicalRecord.patient.user.lastName}`.trim() : ''
  const therapistName = session ? `${session.therapist.firstName} ${session.therapist.lastName}`.trim() : ''

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('sessions.noSessions')} onClose={() => setError(null)} />
      <Link to="/sessions" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('sessions.list')}
      </Link>
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
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('sessions.mood')}: {session.mood}</p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><User size={18} />{t('sessions.patient')}</h2>
          <p className="font-medium text-[var(--text-primary)]">{patientName}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{session.psychologyRecord.medicalRecord.patient.user.email}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><User size={18} />{t('sessions.therapist')}</h2>
          <p className="font-medium text-[var(--text-primary)]">{therapistName}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{session.therapist.email}</p>
        </GlassCard>
      </div>
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
      </>
      )}
    </div>
  )
}
