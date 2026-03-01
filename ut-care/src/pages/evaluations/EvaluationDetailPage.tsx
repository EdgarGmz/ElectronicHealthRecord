import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ClipboardList, User, FileText, ExternalLink } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { getPsychometricEvaluationById, deletePsychometricEvaluation } from '@/services/psychometric-evaluation.service'
import type { PsychometricEvaluation } from '@/types/psychometric-evaluation'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' })
}

function patientName(e: PsychometricEvaluation): string {
  const patient = e.psychologyRecord?.medicalRecord?.patient
  if (!patient?.user) return '—'
  return `${patient.user.firstName} ${patient.user.lastName}`.trim()
}

export function EvaluationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState<PsychometricEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getPsychometricEvaluationById(id)
      .then(setEvaluation)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  const handleDeleteClick = () => setConfirmDeleteOpen(true)
  const handleConfirmDelete = async () => {
    if (!id) return
    setDeleting(true)
    setConfirmDeleteOpen(false)
    try {
      await deletePsychometricEvaluation(id)
      navigate('/evaluations', { replace: true })
    } catch {
      setError(t('common.error'))
    } finally {
      setDeleting(false)
    }
  }

  const administeredByName = evaluation?.administeredByUser
    ? `${evaluation.administeredByUser.firstName} ${evaluation.administeredByUser.lastName}`.trim()
    : '—'
  const rawScore = evaluation?.rawScore != null ? String(evaluation.rawScore) : '—'
  const standardScore = evaluation?.standardScore != null ? String(evaluation.standardScore) : '—'
  const percentile = evaluation?.percentile != null ? `${evaluation.percentile}` : '—'

  return (
    <div className="space-y-6">
      <LoadingModal open={loading || deleting} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('evaluations.noEvaluations')} onClose={() => setError(null)} />
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('evaluations.deleteConfirmTitle')}
        message={t('evaluations.deleteConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        confirming={deleting}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/evaluations" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
          <ArrowLeft size={18} />
          {t('evaluations.list')}
        </Link>
        {evaluation && (
        <GlassButton
          type="button"
          onClick={handleDeleteClick}
          disabled={deleting}
          className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
        >
          {deleting ? t('common.loading') : t('evaluations.delete')}
        </GlassButton>
        )}
      </div>
      {!evaluation && !loading && (
        <GlassCard>
          <p className="text-[var(--text-secondary)]">{t('evaluations.noEvaluations')}</p>
        </GlassCard>
      )}
      {evaluation && (
      <>
      <GlassCard className="border-[var(--color-primary)]/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <ClipboardList className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{evaluation.evaluationType}</h1>
            <p className="mt-1 text-[var(--text-secondary)]">{formatDate(evaluation.applicationDate)}</p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <User size={18} />
            {t('evaluations.patient')}
          </h2>
          <p className="font-medium text-[var(--text-primary)]">{patientName(evaluation)}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <User size={18} />
            {t('evaluations.administeredBy')}
          </h2>
          <p className="font-medium text-[var(--text-primary)]">{administeredByName}</p>
        </GlassCard>
      </div>
      <GlassCard>
        <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Resultados</h2>
        <dl className="grid gap-2 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-[var(--text-muted)]">{t('evaluations.rawScore')}</dt>
            <dd className="text-[var(--text-primary)]">{rawScore}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-muted)]">{t('evaluations.standardScore')}</dt>
            <dd className="text-[var(--text-primary)]">{standardScore}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-muted)]">{t('evaluations.percentile')}</dt>
            <dd className="text-[var(--text-primary)]">{percentile}</dd>
          </div>
        </dl>
      </GlassCard>
      {evaluation.interpretation && (
        <GlassCard>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <FileText size={18} />
            {t('evaluations.interpretation')}
          </h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{evaluation.interpretation}</p>
        </GlassCard>
      )}
      {evaluation.fileUrl && (
        <GlassCard>
          <a
            href={evaluation.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
          >
            <ExternalLink size={18} />
            {t('evaluations.fileUrl')}
          </a>
        </GlassCard>
      )}
      </>
      )}
    </div>
  )
}
