import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { createPsychometricEvaluation } from '@/services/psychometric-evaluation.service'
import type { CreatePsychometricEvaluationInput } from '@/types/psychometric-evaluation'

export function NewEvaluationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CreatePsychometricEvaluationInput & { percentileStr: string }>({
    psychologyRecordId: '',
    evaluationType: '',
    applicationDate: new Date().toISOString().split('T')[0],
    rawScore: '',
    standardScore: '',
    percentileStr: '',
    interpretation: '',
    fileUrl: '',
  })

  const update = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.psychologyRecordId.trim() || !form.evaluationType.trim() || !form.applicationDate) {
      setError(t('common.error'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreatePsychometricEvaluationInput = {
        psychologyRecordId: form.psychologyRecordId.trim(),
        evaluationType: form.evaluationType.trim(),
        applicationDate: form.applicationDate,
      }
      if (form.rawScore !== '') payload.rawScore = Number(form.rawScore) || form.rawScore
      if (form.standardScore !== '') payload.standardScore = Number(form.standardScore) || form.standardScore
      const p = form.percentileStr.trim()
      if (p !== '') payload.percentile = parseInt(p, 10)
      if (form.interpretation?.trim()) payload.interpretation = form.interpretation.trim()
      if (form.fileUrl?.trim()) payload.fileUrl = form.fileUrl.trim()
      const created = await createPsychometricEvaluation(payload)
      navigate(`/evaluations/${created.id}`, { replace: true })
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/evaluations" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('evaluations.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('evaluations.newEvaluation')}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('evaluations.psychologyRecordId')} *</label>
            <input
              type="text"
              value={form.psychologyRecordId}
              onChange={(e) => update('psychologyRecordId', e.target.value)}
              className="glass-input w-full px-4 py-2.5 font-mono text-sm"
              placeholder="UUID del expediente de psicología"
              required
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">{t('evaluations.psychologyRecordIdHelp')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('evaluations.evaluationType')} *</label>
            <input
              type="text"
              value={form.evaluationType}
              onChange={(e) => update('evaluationType', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('evaluations.applicationDate')} *</label>
            <input
              type="date"
              value={form.applicationDate}
              onChange={(e) => update('applicationDate', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('evaluations.rawScore')}</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.rawScore}
                onChange={(e) => update('rawScore', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('evaluations.standardScore')}</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.standardScore}
                onChange={(e) => update('standardScore', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('evaluations.percentile')}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.percentileStr}
                onChange={(e) => update('percentileStr', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('evaluations.interpretation')}</label>
            <textarea
              value={form.interpretation}
              onChange={(e) => update('interpretation', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[100px]"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('evaluations.fileUrl')}</label>
            <input
              type="url"
              value={form.fileUrl}
              onChange={(e) => update('fileUrl', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/evaluations">
              <GlassButton type="button">{t('common.cancel')}</GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
