import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { createMedication } from '@/services/medication.service'
import type { CreateMedicationInput } from '@/types/medication'

export function NewMedicationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateMedicationInput>({
    name: '',
    genericName: '',
    category: '',
    dosageForms: '',
    commonDosages: '',
    administrationRoutes: '',
    contraindications: '',
    sideEffects: '',
    stock: undefined,
  })

  const update = (field: keyof CreateMedicationInput, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.genericName.trim()) {
      setError(t('common.error'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateMedicationInput = {
        name: form.name.trim(),
        genericName: form.genericName.trim(),
      }
      if (form.category?.trim()) payload.category = form.category.trim()
      if (form.dosageForms?.trim()) payload.dosageForms = form.dosageForms.trim()
      if (form.commonDosages?.trim()) payload.commonDosages = form.commonDosages.trim()
      if (form.administrationRoutes?.trim()) payload.administrationRoutes = form.administrationRoutes.trim()
      if (form.contraindications?.trim()) payload.contraindications = form.contraindications.trim()
      if (form.sideEffects?.trim()) payload.sideEffects = form.sideEffects.trim()
      if (typeof form.stock === 'number' && !Number.isNaN(form.stock)) payload.stock = form.stock
      const created = await createMedication(payload)
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
      <SuccessModal open={showSuccess} onClose={() => { setShowSuccess(false); if (createdId) navigate(`/medications/${createdId}`, { replace: true }); setCreatedId(null) }} message={t('common.successSaved')} />
      <Link to="/medications" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('medications.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('medications.newMedication')}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.name')} *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.genericName')} *</label>
            <input
              type="text"
              value={form.genericName}
              onChange={(e) => update('genericName', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.category')}</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.dosageForms')}</label>
            <input
              type="text"
              value={form.dosageForms}
              onChange={(e) => update('dosageForms', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.commonDosages')}</label>
            <input
              type="text"
              value={form.commonDosages}
              onChange={(e) => update('commonDosages', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.administrationRoutes')}</label>
            <input
              type="text"
              value={form.administrationRoutes}
              onChange={(e) => update('administrationRoutes', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.stock', 'Stock')}</label>
            <input
              type="number"
              min={0}
              value={typeof form.stock === 'number' ? form.stock : ''}
              onChange={(e) => update('stock', e.target.value === '' ? undefined : Number(e.target.value))}
              className="glass-input w-full px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.contraindications')}</label>
            <textarea
              value={form.contraindications}
              onChange={(e) => update('contraindications', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[80px]"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('medications.sideEffects')}</label>
            <textarea
              value={form.sideEffects}
              onChange={(e) => update('sideEffects', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[80px]"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/medications">
              <GlassButton type="button">{t('common.cancel')}</GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
