import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, User } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { createInterconsultation } from '@/services/interconsultation.service'
import { getPatients } from '@/services/patient.service'
import { getUsers } from '@/services/user.service'
import { ROLES } from '@/constants/roles'
import type { CreateInterconsultationInput } from '@/types/interconsultation'
import type { Patient } from '@/types/patient'
import type { User as StaffUser } from '@/types/user'
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
  const [professionals, setProfessionals] = useState<StaffUser[]>([])
  const [professionalsLoading, setProfessionalsLoading] = useState(true)
  const [professionalSearch, setProfessionalSearch] = useState('')
  const [showProfessionalSuggestions, setShowProfessionalSuggestions] = useState(false)
  const professionalInputRef = useRef<HTMLDivElement>(null)
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

  // Cargar profesionales destino (psicología y enfermería; lista + filtro local)
  useEffect(() => {
    getUsers({ page: 1, limit: 500 })
      .then((r) => setProfessionals(r.users))
      .catch(() => setProfessionals([]))
      .finally(() => setProfessionalsLoading(false))
  }, [])

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

  const professionalFullName = (u: StaffUser) =>
    `${u.firstName} ${u.lastName}`.trim()

  const filteredProfessionals = useMemo(() => {
    const allowedRoles = [
      ROLES.COORDINADOR_PSICOLOGIA,
      ROLES.COORDINADOR_ENFERMERIA,
      ROLES.PSICOLOGO,
      ROLES.ENFERMERO,
    ]
    const base = professionals.filter((u) => allowedRoles.includes(u.role as (typeof allowedRoles)[number]))
    const q = professionalSearch.trim().toLowerCase()
    if (!q) return base.slice(0, 50)
    return base.filter((u) =>
      professionalFullName(u).toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    ).slice(0, 50)
  }, [professionals, professionalSearch])

  useEffect(() => {
    if (!showProfessionalSuggestions) return
    const onDocClick = (e: MouseEvent) => {
      if (professionalInputRef.current?.contains(e.target as Node)) return
      setShowProfessionalSuggestions(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showProfessionalSuggestions])

  const handleSelectProfessional = (u: StaffUser) => {
    update('toProfessionalId', u.id)
    setProfessionalSearch(professionalFullName(u))
    setShowProfessionalSuggestions(false)
  }

  const handleProfessionalSearchFocus = () => setShowProfessionalSuggestions(true)
  const handleProfessionalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfessionalSearch(e.target.value)
    if (!e.target.value.trim()) update('toProfessionalId', '')
    setShowProfessionalSuggestions(true)
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={submitting || patientsLoading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal open={showSuccess} onClose={() => { setShowSuccess(false); if (createdId) navigate(`/interconsultations/${createdId}`, { replace: true }); setCreatedId(null) }} message={t('common.successSaved')} />
      <Link to="/interconsultations" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('interconsultations.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('interconsultations.newInterconsultation')}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('interconsultations.patient')} *</label>
            <select
              value={form.patientId}
              onChange={(e) => update('patientId', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
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
                className="glass-input w-full px-4 py-2.5"
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
                className="glass-input w-full px-4 py-2.5"
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
              className="glass-input w-full px-4 py-2.5"
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
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <User size={16} className="text-[var(--color-primary)]" />
              {t('interconsultations.toProfessionalOptional')}
            </label>
            <div ref={professionalInputRef} className="relative">
              <input
                type="text"
                value={professionalSearch}
                onChange={handleProfessionalSearchChange}
                onFocus={handleProfessionalSearchFocus}
                placeholder={professionalsLoading ? t('common.loading') : t('common.search')}
                className="glass-input w-full px-4 py-2.5"
                disabled={professionalsLoading}
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showProfessionalSuggestions}
                aria-controls="to-professional-suggestions"
              />
              <input type="hidden" name="toProfessionalId" value={form.toProfessionalId} />
              {showProfessionalSuggestions && (
                <ul
                  id="to-professional-suggestions"
                  role="listbox"
                  className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] shadow-lg backdrop-blur-xl"
                >
                  {filteredProfessionals.length > 0 ? (
                    filteredProfessionals.map((u) => (
                      <li
                        key={u.id}
                        role="option"
                        aria-selected={form.toProfessionalId === u.id}
                        onClick={() => handleSelectProfessional(u)}
                        className="cursor-pointer px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
                      >
                        {professionalFullName(u)}
                        <span className="ml-2 text-[var(--text-muted)]">
                          {u.email}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2.5 text-sm text-[var(--text-muted)]">
                      {professionalSearch.trim() ? t('common.noData') : t('common.search')}
                    </li>
                  )}
                </ul>
              )}
            </div>
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
