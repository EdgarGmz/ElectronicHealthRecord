import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, User, MessageSquare } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { createInterconsultation, getInterconsultationProfessionals, type InterconsultationProfessional } from '@/services/interconsultation.service'
import { getPatients } from '@/services/patient.service'
import type { CreateInterconsultationInput } from '@/types/interconsultation'
import type { Patient } from '@/types/patient'
import { DEPARTMENT_VALUES, URGENCY_VALUES } from '@/types/interconsultation'

export function NewInterconsultationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [professionals, setProfessionals] = useState<InterconsultationProfessional[]>([])
  const [professionalsLoading, setProfessionalsLoading] = useState(true)
  const [form, setForm] = useState<CreateInterconsultationInput & { toProfessionalId: string }>({
    patientId: '',
    fromDepartment: DEPARTMENT_VALUES[0],
    toDepartment: DEPARTMENT_VALUES[1],
    toProfessionalId: '',
    reason: '',
    relevantInformation: '',
    urgency: URGENCY_VALUES[0],
  })

  useEffect(() => {
    getPatients({ limit: 200 })
      .then((r) => setPatients(r.patients))
      .catch(() => setPatients([]))
      .finally(() => setPatientsLoading(false))
  }, [])

  // Cargar profesionales destino filtrados por el departamento destino.
  useEffect(() => {
    setProfessionalsLoading(true)
    setProfessionals([])

    void getInterconsultationProfessionals({ toDepartment: form.toDepartment })
      .then((list) => setProfessionals(list))
      .catch(() => setProfessionals([]))
      .finally(() => setProfessionalsLoading(false))
  }, [form.toDepartment])

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.patientId.trim() || !form.reason.trim()) {
      setError(t('common.error'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateInterconsultationInput = {
        patientId: form.patientId.trim(),
        fromDepartment: form.fromDepartment,
        toDepartment: form.toDepartment,
        reason: form.reason.trim(),
        urgency: form.urgency,
      }
      if (form.relevantInformation?.trim()) payload.relevantInformation = form.relevantInformation.trim()
      if (form.toProfessionalId?.trim()) payload.toProfessionalId = form.toProfessionalId.trim()
      const created = await createInterconsultation(payload)
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

  const patientFullName = (p: Patient) =>
    `${p.user.firstName} ${p.user.lastName}`.trim()

  const professionalFullName = (u: InterconsultationProfessional) =>
    `${u.firstName} ${u.lastName}`.trim()

  // Al cambiar el departamento destino, limpiar el profesional seleccionado (si existía)
  useEffect(() => {
    update('toProfessionalId', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.toDepartment])

  const handleSelectProfessionalId = (id: string) => {
    update('toProfessionalId', id)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <LoadingModal open={submitting || patientsLoading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal open={showSuccess} onClose={() => { setShowSuccess(false); if (createdId) navigate(`/interconsultations/${createdId}`, { replace: true }); setCreatedId(null) }} message={t('common.successSaved')} />
      
      <div className="flex flex-col gap-4">
        <Link to="/interconsultations" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline w-fit">
          <ArrowLeft size={18} />
          {t('interconsultations.list')}
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare className="text-[var(--color-primary)]" size={28} />
              {t('interconsultations.newInterconsultation')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t('interconsultations.newDescription')}
            </p>
          </div>
        </div>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('interconsultations.patient')} *</label>
            <select
              value={form.patientId}
              onChange={(e) => update('patientId', e.target.value)}
              className="glass-input w-full px-4 py-2.5 h-[46px]"
              required
              disabled={patientsLoading}
            >
              <option value="">{patientsLoading ? t('common.loading') : t('interconsultations.selectPatient')}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{patientFullName(p)}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('interconsultations.fromDepartment')} *</label>
              <select
                value={form.fromDepartment}
                onChange={(e) => update('fromDepartment', e.target.value)}
                className="glass-input w-full px-4 py-2.5 h-[46px]"
                required
              >
                {DEPARTMENT_VALUES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('interconsultations.toDepartment')} *</label>
              <select
                value={form.toDepartment}
                onChange={(e) => update('toDepartment', e.target.value)}
                className="glass-input w-full px-4 py-2.5 h-[46px]"
                required
              >
                {DEPARTMENT_VALUES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('interconsultations.urgency')} *</label>
            <select
              value={form.urgency}
              onChange={(e) => update('urgency', e.target.value)}
              className="glass-input w-full px-4 py-2.5 h-[46px]"
              required
            >
              {URGENCY_VALUES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('interconsultations.reason')} *</label>
            <textarea
              value={form.reason}
              onChange={(e) => update('reason', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[100px]"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('interconsultations.relevantInformation')}</label>
            <textarea
              value={form.relevantInformation}
              onChange={(e) => update('relevantInformation', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[80px]"
              rows={2}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] mb-1">
              <User size={16} className="text-[var(--color-primary)]" />
              {t('interconsultations.toProfessionalOptional')}
            </label>
            <select
              value={form.toProfessionalId}
              onChange={(e) => handleSelectProfessionalId(e.target.value)}
              className="glass-input w-full px-4 py-2.5 h-[46px]"
              disabled={professionalsLoading}
            >
              <option value="">
                {t('common.optional', 'Opcional')}
              </option>
              {professionals.map((u) => (
                <option key={u.id} value={u.id}>
                  {professionalFullName(u)}{u.email ? ` (${u.email})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <GlassButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/interconsultations">
              <GlassButton type="button">{t('common.cancel')}</GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
