import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { getTherapySessions } from '@/services/therapy-session.service'
import type { TherapySession } from '@/types/therapy-session'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

export function SessionListPage() {
  const { t } = useTranslation()
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    getTherapySessions({ page, limit: 10 })
      .then((r) => {
        setSessions(r.sessions)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, t])

  const patientName = (s: TherapySession) =>
    `${s.psychologyRecord.medicalRecord.patient.user.firstName} ${s.psychologyRecord.medicalRecord.patient.user.lastName}`.trim()
  const therapistName = (s: TherapySession) => `${s.therapist.firstName} ${s.therapist.lastName}`.trim()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('sessions.title')}</h1>
        <Link to="/sessions/new" className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium">
          <Plus size={18} />
          {t('sessions.newSession')}
        </Link>
      </div>
      <GlassCard>
        {error && <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>}
        {loading ? (
          <p className="py-8 text-center text-[var(--text-muted)]">{t('common.loading')}</p>
        ) : sessions.length === 0 ? (
          <p className="py-8 text-center text-[var(--text-secondary)]">{t('sessions.noSessions')}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('sessions.sessionNumber')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('sessions.patient')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('sessions.therapist')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('sessions.date')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('sessions.duration')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('sessions.mood')}</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b border-[var(--border)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{session.sessionNumber}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{patientName(session)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{therapistName(session)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDateTime(session.sessionDate)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{session.sessionDuration} {t('sessions.minutes')}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{session.mood}</td>
                      <td className="px-4 py-3">
                        <Link to={`/sessions/${session.id}`} className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline">
                          <FileText size={16} />
                          {t('sessions.viewDetail')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <p className="text-sm text-[var(--text-muted)]">
                  {t('sessions.page')} {pagination.page} {t('sessions.of')} {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="glass-button inline-flex items-center gap-1 disabled:opacity-50">
                    <ChevronLeft size={18} />
                    {t('sessions.previous')}
                  </button>
                  <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} className="glass-button inline-flex items-center gap-1 disabled:opacity-50">
                    {t('sessions.next')}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  )
}
