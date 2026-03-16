import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  User,
  Mail,
  UserCircle,
  Phone,
  Heart,
  Users,
  Briefcase,
  Save,
  X,
} from 'lucide-react'

const WhatsAppIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'
import { createPatient } from '@/services/patient.service'
import { getCareers } from '@/services/career.service'
import { getMyCareers } from '@/services/profile.service'
import type { CreatePatientInput } from '@/services/patient.service'
import type { Career } from '@/types/career'

const PATIENT_TYPES = ['student', 'faculty', 'administrative'] as const
const MARITAL_STATUSES = ['single', 'married', 'separated', 'common_law'] as const

const inputBaseClass =
  'glass-input w-full rounded-xl px-4 py-2.5 transition focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2'

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.02] p-4 sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        <Icon size={18} className="text-[var(--color-primary)]" aria-hidden />
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({
  id,
  label,
  required,
  error,
  children,
  hint,
}: {
  id: string
  label: React.ReactNode
  required?: boolean
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
        {label}
        {required && <span className="text-[var(--color-error)]" aria-hidden>*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}

export function NewPatientPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const isPsychologist = role === ROLES.PSICOLOGO

  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null)
  const [careers, setCareers] = useState<Career[]>([])
  const [careersLoading, setCareersLoading] = useState(true)
  const [form, setForm] = useState<CreatePatientInput & { trimesterStr: string }>({
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    patientType: 'student',
    careerId: '',
    phone: '',
    enrollmentNumber: '',
    maritalStatus: 'single',
    guardianName: '',
    guardianPhone: '',
    group: '',
    occupation: '',
    trimesterStr: '',
  })

  useEffect(() => {
    setCareersLoading(true)
    if (isPsychologist) {
      Promise.all([getMyCareers(), getCareers()])
        .then(([ids, allCareers]) => {
          const byId = new Set(ids)
          const list = allCareers.filter((c) => byId.has(c.id))
          setCareers(list)
          setForm((prev) => {
            if (!prev.careerId) return prev
            if (!list.some((c) => c.id === prev.careerId)) return { ...prev, careerId: '' }
            return prev
          })
        })
        .catch(() => setError(t('common.error')))
        .finally(() => setCareersLoading(false))
    } else {
      getCareers()
        .then(setCareers)
        .catch(() => setError(t('common.error')))
        .finally(() => setCareersLoading(false))
    }
  }, [t, isPsychologist])

  const update = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'patientType' && value !== 'student') next.careerId = ''
      return next
    })
    setError('')
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validate = (): boolean => {
    const err: Record<string, string> = {}
    if (!form.firstName.trim()) err.firstName = t('patients.requiredField')
    if (!form.lastName.trim()) err.lastName = t('patients.requiredField')
    if (!form.email.trim()) err.email = t('patients.requiredField')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) err.email = t('patients.invalidEmail')
    if (!form.dateOfBirth.trim()) err.dateOfBirth = t('patients.requiredField')
    if (!form.patientType) err.patientType = t('patients.requiredField')
    const needsCareer = form.patientType === 'student'
    if (needsCareer && !form.careerId?.trim()) err.careerId = t('patients.requiredField')
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    const needsCareer = form.patientType === 'student'
    setSubmitting(true)
    try {
      const payload: CreatePatientInput = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth.trim(),
        patientType: form.patientType,
      }
      if (needsCareer && form.careerId?.trim()) payload.careerId = form.careerId.trim()
      if (form.phone?.trim()) payload.phone = form.phone.trim()
      if (form.enrollmentNumber?.trim()) payload.enrollmentNumber = form.enrollmentNumber.trim()
      payload.maritalStatus = form.maritalStatus || 'single'
      if (form.guardianName?.trim()) payload.guardianName = form.guardianName.trim()
      if (form.guardianPhone?.trim()) payload.guardianPhone = form.guardianPhone.trim()
      if (form.group?.trim()) payload.group = form.group.trim()
      if (form.occupation?.trim()) payload.occupation = form.occupation.trim()
      const tri = form.trimesterStr.trim() ? parseInt(form.trimesterStr, 10) : undefined
      if (tri !== undefined && !Number.isNaN(tri) && tri >= 1 && tri <= 12) payload.trimester = tri

      const patient = await createPatient(payload)
      setCreatedPatientId(patient.id)
      setShowSuccess(true)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setError(msg === 'Email already registered' ? t('patients.emailAlreadyRegistered') : (msg || t('common.error')))
    } finally {
      setSubmitting(false)
    }
  }

  const isStudent = form.patientType === 'student'

  return (
    <div className="space-y-6">
      <LoadingModal open={submitting || careersLoading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          if (createdPatientId) navigate(`/patients/${createdPatientId}`, { replace: true })
          setCreatedPatientId(null)
        }}
        message={t('common.successSaved')}
      />

      <Link
        to="/patients"
        className="inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:underline"
      >
        <ArrowLeft size={18} aria-hidden />
        {t('patients.list')}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('patients.newPatient')}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('patients.formNewPatientDescription')}</p>
      </div>

      <GlassCard className="overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title={t('patients.formSectionPersonal')} icon={User}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="new-patient-firstName"
                label={t('patients.firstName')}
                required
                error={fieldErrors.firstName}
              >
                <input
                  id="new-patient-firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  className={`${inputBaseClass} ${fieldErrors.firstName ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  autoComplete="given-name"
                  aria-invalid={!!fieldErrors.firstName}
                  aria-describedby={fieldErrors.firstName ? 'new-patient-firstName-error' : undefined}
                />
              </Field>
              <Field
                id="new-patient-lastName"
                label={t('patients.lastName')}
                required
                error={fieldErrors.lastName}
              >
                <input
                  id="new-patient-lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  className={`${inputBaseClass} ${fieldErrors.lastName ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  autoComplete="family-name"
                  aria-invalid={!!fieldErrors.lastName}
                  aria-describedby={fieldErrors.lastName ? 'new-patient-lastName-error' : undefined}
                />
              </Field>
            </div>
            <Field id="new-patient-dateOfBirth" label={t('patients.dateOfBirth')} required error={fieldErrors.dateOfBirth}>
              <input
                id="new-patient-dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                className={`${inputBaseClass} ${fieldErrors.dateOfBirth ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                aria-invalid={!!fieldErrors.dateOfBirth}
                aria-describedby={fieldErrors.dateOfBirth ? 'new-patient-dateOfBirth-error' : undefined}
              />
            </Field>
          </FormSection>

          <FormSection title={t('patients.formSectionTypeCareer')} icon={UserCircle}>
            <Field id="new-patient-patientType" label={t('patients.type')} required error={fieldErrors.patientType}>
              <select
                id="new-patient-patientType"
                value={form.patientType}
                onChange={(e) => update('patientType', e.target.value)}
                className={`${inputBaseClass} ${fieldErrors.patientType ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                aria-invalid={!!fieldErrors.patientType}
                aria-describedby={fieldErrors.patientType ? 'new-patient-patientType-error' : undefined}
              >
                {PATIENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`patients.${type}`)}
                  </option>
                ))}
              </select>
            </Field>

            {isStudent ? (
              <div
                className="transition-opacity duration-200"
                role="region"
                aria-label={t('patients.career')}
              >
                <Field
                  id="new-patient-careerId"
                  label={t('patients.career')}
                  required
                  error={fieldErrors.careerId}
                >
                  <select
                    id="new-patient-careerId"
                    value={form.careerId}
                    onChange={(e) => update('careerId', e.target.value)}
                    className={`${inputBaseClass} ${fieldErrors.careerId ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                    disabled={careersLoading}
                    aria-invalid={!!fieldErrors.careerId}
                    aria-describedby={fieldErrors.careerId ? 'new-patient-careerId-error' : undefined}
                  >
                    <option value="">{careersLoading ? t('common.loading') : t('patients.selectCareer')}</option>
                    {careers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">{t('patients.careerNotRequiredForFacultyAdmin')}</p>
            )}

            {(isStudent || form.patientType === 'faculty' || form.patientType === 'administrative') && (
              <Field
                id="new-patient-enrollmentNumber"
                label={isStudent ? t('patients.enrollment') : t('patients.employeeNumber')}
              >
                <input
                  id="new-patient-enrollmentNumber"
                  type="text"
                  value={form.enrollmentNumber}
                  onChange={(e) => update('enrollmentNumber', e.target.value)}
                  className={inputBaseClass}
                  autoComplete="off"
                  aria-label={isStudent ? t('patients.enrollment') : t('patients.employeeNumber')}
                />
              </Field>
            )}

            {isStudent && (
              <Field id="new-patient-group" label={t('patients.group')}>
                <input
                  id="new-patient-group"
                  type="text"
                  value={form.group}
                  onChange={(e) => update('group', e.target.value)}
                  className={inputBaseClass}
                  autoComplete="off"
                />
              </Field>
            )}

            {isStudent && (
              <Field id="new-patient-trimester" label={t('patients.trimester')} hint="1-12">
                <input
                  id="new-patient-trimester"
                  type="number"
                  min={1}
                  max={12}
                  value={form.trimesterStr}
                  onChange={(e) => update('trimesterStr', e.target.value)}
                  className={inputBaseClass}
                  placeholder="1-12"
                  aria-label={t('patients.trimester')}
                />
              </Field>
            )}
          </FormSection>

          <FormSection title={t('patients.formSectionContact')} icon={Phone}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="new-patient-email"
                label={
                  <>
                    <Mail size={18} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
                    {t('patients.email')}
                  </>
                }
                required
                error={fieldErrors.email}
              >
                <input
                  id="new-patient-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={`${inputBaseClass} ${fieldErrors.email ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  autoComplete="email"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'new-patient-email-error' : undefined}
                />
              </Field>
              <Field
                id="new-patient-phone"
                label={
                  <>
                    <span className="flex items-center gap-1.5 text-[#25D366]" aria-hidden>
                      <WhatsAppIcon className="h-4 w-4 shrink-0" />
                    </span>
                    {t('patients.whatsapp')}
                  </>
                }
              >
                <input
                  id="new-patient-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={inputBaseClass}
                  autoComplete="tel"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title={t('patients.formSectionMarital')} icon={Heart}>
            <Field id="new-patient-maritalStatus" label={t('patients.maritalStatus')}>
              <select
                id="new-patient-maritalStatus"
                value={form.maritalStatus}
                onChange={(e) => update('maritalStatus', e.target.value)}
                className={inputBaseClass}
              >
                {MARITAL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(
                      `patients.marital${status === 'common_law' ? 'CommonLaw' : status.charAt(0).toUpperCase() + status.slice(1)}`
                    )}
                  </option>
                ))}
              </select>
            </Field>
          </FormSection>

          <FormSection title={t('patients.formSectionGuardian')} icon={Users}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="new-patient-guardianName" label={t('patients.guardianName')}>
                <input
                  id="new-patient-guardianName"
                  type="text"
                  value={form.guardianName}
                  onChange={(e) => update('guardianName', e.target.value)}
                  className={inputBaseClass}
                  autoComplete="off"
                />
              </Field>
              <Field
                id="new-patient-guardianPhone"
                label={
                  <>
                    <span className="flex items-center gap-1.5 text-[#25D366]" aria-hidden>
                      <WhatsAppIcon className="h-4 w-4 shrink-0" />
                    </span>
                    {t('patients.guardianPhone')}
                  </>
                }
              >
                <input
                  id="new-patient-guardianPhone"
                  type="tel"
                  value={form.guardianPhone}
                  onChange={(e) => update('guardianPhone', e.target.value)}
                  className={inputBaseClass}
                  autoComplete="tel"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title={t('patients.formSectionAcademic')} icon={Briefcase}>
            <Field id="new-patient-occupation" label={t('patients.occupation')}>
              <input
                id="new-patient-occupation"
                type="text"
                value={form.occupation}
                onChange={(e) => update('occupation', e.target.value)}
                className={inputBaseClass}
                autoComplete="organization-title"
              />
            </Field>
          </FormSection>

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
            <GlassButton
              type="submit"
              variant="primary"
              disabled={submitting || careersLoading}
              className="inline-flex items-center gap-2"
            >
              <Save size={18} aria-hidden />
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/patients">
              <GlassButton type="button" className="inline-flex items-center gap-2">
                <X size={18} aria-hidden />
                {t('common.cancel')}
              </GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
