import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getPsychometricEvaluations } from '@/services/psychometric-evaluation.service'
import type { PsychometricEvaluation } from '@/types/psychometric-evaluation'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

function patientName(e: PsychometricEvaluation): string {
  const patient = e.psychologyRecord?.medicalRecord?.patient
  if (!patient?.user) return '—'
  return `${patient.user.firstName} ${patient.user.lastName}`.trim()
}

function administeredByName(e: PsychometricEvaluation): string {
  if (!e.administeredByUser) return '—'
  return `${e.administeredByUser.firstName} ${e.administeredByUser.lastName}`.trim()
}

export function EvaluationListPage() {
  const { t } = useTranslation()
  const [evaluations, setEvaluations] = useState<PsychometricEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [evaluationType, setEvaluationType] = useState('')
  const [applicationDateFrom, setApplicationDateFrom] = useState('')
  const [applicationDateTo, setApplicationDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    getPsychometricEvaluations({
      page,
      limit: 10,
      evaluationType: evaluationType || undefined,
      applicationDateFrom: applicationDateFrom || undefined,
      applicationDateTo: applicationDateTo || undefined,
    })
      .then((r) => {
        setEvaluations(r.evaluations)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [page, evaluationType, applicationDateFrom, applicationDateTo, t])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('evaluations.title')}</h1>
        <Link
          to="/evaluations/new"
          className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium"
        >
          <Plus size={18} />
          {t('evaluations.newEvaluation')}
        </Link>
      </div>
      <GlassCard>
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            value={evaluationType}
            onChange={(e) => { setEvaluationType(e.target.value); setPage(1) }}
            placeholder={t('evaluations.evaluationType')}
            className="glass-input w-full sm:w-48 px-4 py-2.5"
          />
          <input
            type="date"
            value={applicationDateFrom}
            onChange={(e) => { setApplicationDateFrom(e.target.value); setPage(1) }}
            placeholder="Desde"
            className="glass-input w-full sm:w-40 px-4 py-2.5"
          />
          <input
            type="date"
            value={applicationDateTo}
            onChange={(e) => { setApplicationDateTo(e.target.value); setPage(1) }}
            placeholder="Hasta"
            className="glass-input w-full sm:w-40 px-4 py-2.5"
          />
        </div>
        {loading ? null : evaluations.length === 0 ? (
          <p className="py-8 text-center text-[var(--text-secondary)]">{t('evaluations.noEvaluations')}</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('evaluations.evaluationType')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('evaluations.patient')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('evaluations.applicationDate')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('evaluations.administeredBy')}</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((ev) => (
                    <tr
                      key={ev.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{ev.evaluationType}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{patientName(ev)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(ev.applicationDate)}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{administeredByName(ev)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/evaluations/${ev.id}`}
                          className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                        >
                          <ClipboardList size={16} />
                          {t('evaluations.viewDetail')}
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
                  {t('evaluations.page')} {pagination.page} {t('evaluations.of')} {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                    {t('evaluations.previous')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {t('evaluations.next')}
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
