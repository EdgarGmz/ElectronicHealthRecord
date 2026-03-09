import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { createNotification } from '@/services/notification.service'
import type { CreateNotificationInput } from '@/types/notification'
import { NOTIFICATION_PRIORITIES } from '@/types/notification'

export function NewNotificationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateNotificationInput & { title: string }>({
    userId: '',
    type: '',
    title: '',
    message: '',
    priority: 'normal',
    relatedEntityType: '',
    relatedEntityId: '',
  })

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.userId.trim() || !form.type.trim() || !form.title.trim() || !form.message.trim()) {
      setError(t('common.error'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateNotificationInput = {
        userId: form.userId.trim(),
        type: form.type.trim(),
        title: form.title.trim(),
        message: form.message.trim(),
        priority: form.priority || 'normal',
      }
      if (form.relatedEntityType?.trim()) payload.relatedEntityType = form.relatedEntityType.trim()
      if (form.relatedEntityId?.trim()) payload.relatedEntityId = form.relatedEntityId.trim()
      const created = await createNotification(payload)
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
      <SuccessModal open={showSuccess} onClose={() => { setShowSuccess(false); if (createdId) navigate(`/notifications/${createdId}`, { replace: true }); setCreatedId(null) }} message={t('common.successSaved')} />
      <Link to="/notifications" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('notifications.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('notifications.newNotification')}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.recipient')} *</label>
            <input
              type="text"
              value={form.userId}
              onChange={(e) => update('userId', e.target.value)}
              className="glass-input w-full px-4 py-2.5 font-mono text-sm"
              placeholder="UUID del usuario"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.type')} *</label>
            <input
              type="text"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              placeholder="ej. appointment_reminder, system_alert"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.notificationTitle')} *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.message')} *</label>
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[120px]"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('notifications.priority')}</label>
            <select
              value={form.priority}
              onChange={(e) => update('priority', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
            >
              {NOTIFICATION_PRIORITIES.map((p) => (
                <option key={p} value={p}>{t(`notifications.${p === 'normal' ? 'priorityNormal' : p === 'high' ? 'priorityHigh' : 'priorityUrgent'}`)}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Entidad relacionada (tipo)</label>
              <input
                type="text"
                value={form.relatedEntityType}
                onChange={(e) => update('relatedEntityType', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Entidad relacionada (ID)</label>
              <input
                type="text"
                value={form.relatedEntityId}
                onChange={(e) => update('relatedEntityId', e.target.value)}
                className="glass-input w-full px-4 py-2.5 font-mono text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/notifications">
              <GlassButton type="button">{t('common.cancel')}</GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
