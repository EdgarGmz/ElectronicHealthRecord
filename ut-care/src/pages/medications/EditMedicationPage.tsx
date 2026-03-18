import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { getMedicationById, updateMedication } from '@/services/medication.service'
import type { UpdateMedicationInput, MedicationWithPrescriptions } from '@/types/medication'
import { useAuthStore } from '@/store/auth.store'
import { ROLES, ROLES_CAN_MANAGE_MEDICATIONS } from '@/constants/roles'

export function EditMedicationPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const role = user?.role?.toLowerCase()?.trim() ?? ''
  const canManage = role ? ROLES_CAN_MANAGE_MEDICATIONS.includes(role) : false

  const [medication, setMedication] = useState<MedicationWithPrescriptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const [form, setForm] = useState<UpdateMedicationInput>({
    name: '',
    genericName: '',
    category: '',
    dosageForms: '',
    commonDosages: '',
    administrationRoutes: '',
    contraindications: '',
    sideEffects: '',
    stock: 0,
    isActive: true,
  })

  const isCoordinatorNursing = role === ROLES.COORDINADOR_ENFERMERIA

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    getMedicationById(id)
      .then((m) => {
        setMedication(m)
        setForm({
          name: m.name ?? '',
          genericName: m.genericName ?? '',
          category: m.category ?? '',
          dosageForms: m.dosageForms ?? '',
          commonDosages: m.commonDosages ?? '',
          administrationRoutes: m.administrationRoutes ?? '',
          contraindications: m.contraindications ?? '',
          sideEffects: m.sideEffects ?? '',
          stock: m.stock ?? 0,
          isActive: m.isActive ?? true,
        })
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  const update = (field: keyof UpdateMedicationInput, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const payload = useMemo(() => {
    // Send trimmed strings; avoid sending empty optional fields as empty strings.
    const out: UpdateMedicationInput = {
      name: form.name?.trim(),
      genericName: form.genericName?.trim(),
      isActive: form.isActive,
      stock: typeof form.stock === 'number' ? form.stock : Number(form.stock),
    }
    if (form.category?.trim()) out.category = form.category.trim()
    if (form.dosageForms?.trim()) out.dosageForms = form.dosageForms.trim()
    if (form.commonDosages?.trim()) out.commonDosages = form.commonDosages.trim()
    if (form.administrationRoutes?.trim()) out.administrationRoutes = form.administrationRoutes.trim()
    if (form.contraindications?.trim()) out.contraindications = form.contraindications.trim()
    if (form.sideEffects?.trim()) out.sideEffects = form.sideEffects.trim()
    return out
  }, [form])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError('')
    if (!payload.name?.trim() || !payload.genericName?.trim()) {
      setError(t('common.missingRequiredFields', 'Faltan campos requeridos'))
      return
    }
    setSubmitting(true)
    try {
      await updateMedication(id, payload)
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

  if (!isCoordinatorNursing || !canManage) {
    // RoleGuard will also prevent navigation if you add path restrictions later,
    // but keep UI safe.
    return (
      <div className="space-y-6">
        <GlassCard>
          <p className="text-sm text-[var(--text-secondary)]">{t('common.unauthorized', 'Acceso no autorizado')}</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading || submitting} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          navigate(id ? `/medications/${id}` : '/medications', { replace: true })
        }}
        message={t('common.successSaved')}
      />

      <Link to={id ? `/medications/${id}` : '/medications'} className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('common.back', 'Volver')}
      </Link>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('common.edit', 'Editar')}</h1>

      {!medication && !loading ? (
        <GlassCard>
          <p className="text-[var(--text-secondary)]">{t('medications.noMedications')}</p>
        </GlassCard>
      ) : (
        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.name')} *</label>
                <input
                  type="text"
                  value={form.name ?? ''}
                  onChange={(e) => update('name', e.target.value)}
                  className="glass-input w-full px-4 py-2.5"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.genericName')} *</label>
                <input
                  type="text"
                  value={form.genericName ?? ''}
                  onChange={(e) => update('genericName', e.target.value)}
                  className="glass-input w-full px-4 py-2.5"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.category')}</label>
                <input
                  type="text"
                  value={form.category ?? ''}
                  onChange={(e) => update('category', e.target.value)}
                  className="glass-input w-full px-4 py-2.5"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.stock')}</label>
                <input
                  type="number"
                  min={0}
                  value={typeof form.stock === 'number' ? form.stock : Number(form.stock ?? 0)}
                  onChange={(e) => update('stock', Number(e.target.value))}
                  className="glass-input w-full px-4 py-2.5"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.dosageForms')}</label>
              <input
                type="text"
                value={form.dosageForms ?? ''}
                onChange={(e) => update('dosageForms', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.commonDosages')}</label>
              <input
                type="text"
                value={form.commonDosages ?? ''}
                onChange={(e) => update('commonDosages', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.administrationRoutes')}</label>
              <input
                type="text"
                value={form.administrationRoutes ?? ''}
                onChange={(e) => update('administrationRoutes', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.contraindications')}</label>
              <textarea
                value={form.contraindications ?? ''}
                onChange={(e) => update('contraindications', e.target.value)}
                className="glass-input w-full px-4 py-2.5 min-h-[80px]"
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{t('medications.sideEffects')}</label>
              <textarea
                value={form.sideEffects ?? ''}
                onChange={(e) => update('sideEffects', e.target.value)}
                className="glass-input w-full px-4 py-2.5 min-h-[80px]"
                rows={3}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) => update('isActive', e.target.checked)}
                />
                {t('medications.active')}
              </label>

              <div className="flex gap-3">
                <GlassButton type="submit" variant="primary" disabled={submitting}>
                  {submitting ? t('common.loading') : t('common.save')}
                </GlassButton>
                <Link to={id ? `/medications/${id}` : '/medications'}>
                  <GlassButton type="button">{t('common.cancel')}</GlassButton>
                </Link>
              </div>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  )
}

