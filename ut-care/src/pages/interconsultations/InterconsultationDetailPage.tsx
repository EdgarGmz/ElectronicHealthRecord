import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MessageSquare, User, FileText } from 'lucide-react'
import { EmailLink } from '@/components/atoms/EmailLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getInterconsultationById, respondToInterconsultation } from '@/services/interconsultation.service'
import type { Interconsultation } from '@/types/interconsultation'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
}

function patientName(i: Interconsultation): string {
  if (!i.patient?.user) return '—'
  return `${i.patient.user.firstName} ${i.patient.user.lastName}`.trim()
}

function professionalName(u: { firstName: string; lastName: string } | undefined): string {
  if (!u) return '—'
  return `${u.firstName} ${u.lastName}`.trim()
}

const STATUS_KEY: Record<string, string> = {
  Pendiente: 'statusPending',
  Respondida: 'statusResponded',
  Cancelada: 'statusCancelled',
}
const URGENCY_KEY: Record<string, string> = {
  Baja: 'urgencyLow',
  Media: 'urgencyMedium',
  Alta: 'urgencyHigh',
  Urgente: 'urgencyUrgent',
}

export function InterconsultationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [interconsultation, setInterconsultation] = useState<Interconsultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)
  const [responseError, setResponseError] = useState<string | null>(null)

  const load = () => {
    if (!id) return
    setLoading(true)
    setError(null)
    getInterconsultationById(id)
      .then(setInterconsultation)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [id, t])

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !responseText.trim()) return
    setResponseError(null)
    setSubmittingResponse(true)
    try {
      await respondToInterconsultation(id, responseText.trim())
      setResponseText('')
      load()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setResponseError(msg || t('common.error'))
    } finally {
      setSubmittingResponse(false)
    }
  }

  const isPending = interconsultation?.status === 'Pendiente'

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <LoadingModal open={loading || submittingResponse} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('interconsultations.noInterconsultations')} onClose={() => setError(null)} />
      
      <div className="flex flex-col gap-4">
        <Link to="/interconsultations" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline w-fit">
          <ArrowLeft size={18} />
          {t('interconsultations.list')}
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare className="text-[var(--color-primary)]" size={28} />
              {t('interconsultations.detailTitle')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t('interconsultations.detailDescription')}
            </p>
          </div>
        </div>
      </div>

      {!interconsultation && !loading && (
        <GlassCard>
          <p className="text-[var(--text-secondary)]">{t('interconsultations.noInterconsultations')}</p>
        </GlassCard>
      )}
      {interconsultation && (
      <>
      <GlassCard className="border-[var(--color-primary)]/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <MessageSquare className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {interconsultation.fromDepartment} → {interconsultation.toDepartment}
            </h2>
            <p className="mt-1 text-[var(--text-secondary)]">
              {t(`interconsultations.${STATUS_KEY[interconsultation.status] || interconsultation.status}`)} · {t(`interconsultations.${URGENCY_KEY[interconsultation.urgency] || interconsultation.urgency}`)}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{formatDateTime(interconsultation.createdAt)}</p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <User size={18} />
            {t('interconsultations.patient')}
          </h2>
          <p className="font-medium text-[var(--text-primary)]">{patientName(interconsultation)}</p>
          {interconsultation.patient?.user?.email && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              <EmailLink email={interconsultation.patient.user.email} />
            </p>
          )}
        </GlassCard>
        <GlassCard>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <User size={18} />
            {t('interconsultations.fromProfessional')}
          </h2>
          <p className="font-medium text-[var(--text-primary)]">{professionalName(interconsultation.fromProfessional)}</p>
          {interconsultation.toProfessional && (
            <>
              <h2 className="mt-3 mb-1 text-sm font-semibold text-[var(--text-primary)]">{t('interconsultations.toProfessional')}</h2>
              <p className="text-[var(--text-secondary)]">{professionalName(interconsultation.toProfessional)}</p>
            </>
          )}
        </GlassCard>
      </div>
      <GlassCard>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <FileText size={18} />
          {t('interconsultations.reason')}
        </h2>
        <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{interconsultation.reason}</p>
      </GlassCard>
      {interconsultation.relevantInformation && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('interconsultations.relevantInformation')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{interconsultation.relevantInformation}</p>
        </GlassCard>
      )}
      {interconsultation.response && (
        <GlassCard>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('interconsultations.response')}</h2>
          <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{interconsultation.response}</p>
          {interconsultation.respondedByUser && (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {t('interconsultations.respondedBy')}: {professionalName(interconsultation.respondedByUser)}
              {interconsultation.respondedAt && ` · ${formatDateTime(interconsultation.respondedAt)}`}
            </p>
          )}
        </GlassCard>
      )}
      {isPending && (
        <GlassCard>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{t('interconsultations.addResponse')}</h2>
          <form onSubmit={handleSubmitResponse} className="space-y-3">
            {responseError && <p className="text-sm text-[var(--color-error)]">{responseError}</p>}
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder={t('interconsultations.responsePlaceholder')}
              className="glass-input w-full px-4 py-2.5 min-h-[120px]"
              rows={4}
              required
            />
            <GlassButton type="submit" variant="primary" disabled={submittingResponse}>
              {submittingResponse ? t('common.loading') : t('common.save')}
            </GlassButton>
          </form>
        </GlassCard>
      )}
      </>
      )}
    </div>
  )
}
