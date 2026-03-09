import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { createTherapySession } from '@/services/therapy-session.service'
import type { CreateTherapySessionInput } from '@/types/therapy-session'

const DEFAULT_DURATION = 50

export function NewSessionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateTherapySessionInput & { sessionDurationStr: string }>({
    psychologyRecordId: '',
    sessionNumber: 1,
    sessionDate: new Date().toISOString().slice(0, 10),
    sessionDurationStr: String(DEFAULT_DURATION),
    mood: '',
    evolutionNotes: '',
    patientProgress: '',
    assignedTasks: '',
    observations: '',
    nextSessionPlan: '',
  })

  const update = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.psychologyRecordId.trim() || !form.mood.trim()) {
      setError(t('common.error'))
      return
    }
    const duration = parseInt(form.sessionDurationStr, 10)
    if (Number.isNaN(duration) || duration < 1) {
      setError(t('common.error'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateTherapySessionInput = {
        psychologyRecordId: form.psychologyRecordId.trim(),
        sessionNumber: form.sessionNumber,
        sessionDate: form.sessionDate,
        sessionDuration: duration,
        mood: form.mood.trim(),
      }
      if (form.evolutionNotes?.trim()) payload.evolutionNotes = form.evolutionNotes.trim()
      if (form.patientProgress?.trim()) payload.patientProgress = form.patientProgress.trim()
      if (form.assignedTasks?.trim()) payload.assignedTasks = form.assignedTasks.trim()
      if (form.observations?.trim()) payload.observations = form.observations.trim()
      if (form.nextSessionPlan?.trim()) payload.nextSessionPlan = form.nextSessionPlan.trim()
      const created = await createTherapySession(payload)
      setCreatedId(created.id)
      setShowSuccess(true)
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
      <LoadingModal open={submitting} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          if (createdId) navigate(`/sessions/${createdId}`, { replace: true })
          setCreatedId(null)
        }}
        message={t('common.successSaved')}
      />
      <Link to="/sessions" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('sessions.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('sessions.newSession')}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
              {t('sessions.psychologyRecordId')} *
            </label>
            <input
              type="text"
              value={form.psychologyRecordId}
              onChange={(e) => update('psychologyRecordId', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              placeholder={t('sessions.psychologyRecordIdHelp')}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                {t('sessions.sessionNumber')} *
              </label>
              <input
                type="number"
                min={1}
                value={form.sessionNumber}
                onChange={(e) => update('sessionNumber', parseInt(e.target.value, 10) || 1)}
                className="glass-input w-full px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                {t('sessions.date')} *
              </label>
              <input
                type="date"
                value={form.sessionDate}
                onChange={(e) => update('sessionDate', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                {t('sessions.duration')} ({t('sessions.minutes')})
              </label>
              <input
                type="number"
                min={1}
                value={form.sessionDurationStr}
                onChange={(e) => update('sessionDurationStr', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
              {t('sessions.mood')} *
            </label>
            <input
              type="text"
              maxLength={30}
              value={form.mood}
              onChange={(e) => update('mood', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
              {t('sessions.evolutionNotes')}
            </label>
            <textarea
              value={form.evolutionNotes}
              onChange={(e) => update('evolutionNotes', e.target.value)}
              className="glass-input min-h-[80px] w-full px-4 py-2.5"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
              {t('sessions.patientProgress')}
            </label>
            <textarea
              value={form.patientProgress}
              onChange={(e) => update('patientProgress', e.target.value)}
              className="glass-input min-h-[80px] w-full px-4 py-2.5"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
              {t('sessions.assignedTasks')}
            </label>
            <textarea
              value={form.assignedTasks}
              onChange={(e) => update('assignedTasks', e.target.value)}
              className="glass-input min-h-[80px] w-full px-4 py-2.5"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
              {t('sessions.observations')}
            </label>
            <textarea
              value={form.observations}
              onChange={(e) => update('observations', e.target.value)}
              className="glass-input min-h-[80px] w-full px-4 py-2.5"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
              {t('sessions.nextSessionPlan')}
            </label>
            <textarea
              value={form.nextSessionPlan}
              onChange={(e) => update('nextSessionPlan', e.target.value)}
              className="glass-input min-h-[80px] w-full px-4 py-2.5"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/sessions">
              <GlassButton type="button">{t('common.cancel')}</GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
