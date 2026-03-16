import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, User, BarChart3, Plus } from 'lucide-react'
import {
  BarChart,
  Bar,
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
import { getTherapySessionById, getTherapySessions } from '@/services/therapy-session.service'
import { getMoods } from '@/services/mood.service'
import type { TherapySession } from '@/types/therapy-session'
import type { Mood } from '@/types/mood'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
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
  const [session, setSession] = useState<TherapySession | null>(null)
  const [moods, setMoods] = useState<Mood[]>([])
  const [allSessions, setAllSessions] = useState<TherapySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
              <BarChart data={evolutionChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="sessionLabel" stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
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
                <Bar dataKey="positive" name={t('sessions.evolutionChartPositive')} stackId="a" fill="var(--color-success)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="other" name={t('sessions.evolutionChartOther')} stackId="a" fill="var(--color-primary)" radius={[0, 0, 0, 0]} />
              </BarChart>
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
      </>
      )}
    </div>
  )
}
