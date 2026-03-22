import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
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
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { getPatientById, updatePatient, type UpdatePatientInput } from '@/services/patient.service'
import { getCareers } from '@/services/career.service'
import { getMyCareers } from '@/services/profile.service'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'
import type { Patient } from '@/types/patient'
import type { Career } from '@/types/career'
import {
  FormSection,
  Field,
  inputBaseClass,
  PATIENT_TYPES,
  MARITAL_STATUSES,
  WhatsAppIcon,
} from './NewPatientPage'

type FormState = UpdatePatientInput & { trimesterStr: string }

function toDateInputValue(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return ''
  const d = new Date(isoOrDate)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function EditPatientPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const isPsychologist = role === ROLES.PSICOLOGO

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [careers, setCareers] = useState<Career[]>([])
  const [careersLoading, setCareersLoading] = useState(true)
  const [form, setForm] = useState<FormState>({
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
    if (!id) return
    setLoading(true)
    setError('')
    getPatientById(id)
      .then((p) => {
        setPatient(p)
        setForm({
          email: p.user.email ?? '',
          firstName: p.user.firstName ?? '',
          lastName: p.user.lastName ?? '',
          dateOfBirth: toDateInputValue(p.user.dateOfBirth),
          patientType: p.patientType ?? 'student',
          careerId: p.careerId ?? '',
          phone: p.user.phone ?? '',
          enrollmentNumber: p.user.enrollmentNumber ?? '',
          maritalStatus: p.maritalStatus ?? 'single',
          guardianName: p.guardianName ?? '',
          guardianPhone: p.guardianPhone ?? '',
          group: p.group ?? '',
          occupation: p.occupation ?? '',
          trimesterStr: p.trimester != null ? String(p.trimester) : '',
        })
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  useEffect(() => {
    if (isPsychologist) {
      Promise.all([getMyCareers(), getCareers()])
        .then(([ids, allCareers]) => {
          const byId = new Set(ids)
          setCareers(allCareers.filter((c) => byId.has(c.id)))
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

  const update = (field: keyof FormState, value: string | number) => {
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
    if (!form.firstName?.trim()) err.firstName = t('patients.requiredField')
    if (!form.lastName?.trim()) err.lastName = t('patients.requiredField')
    if (!form.email?.trim()) err.email = t('patients.requiredField')
    else if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) err.email = t('patients.invalidEmail')
    if (!form.dateOfBirth?.trim()) err.dateOfBirth = t('patients.requiredField')
    if (!form.patientType) err.patientType = t('patients.requiredField')
    if (form.patientType === 'student' && !form.careerId?.trim()) err.careerId = t('patients.requiredField')
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate() || !id) return
    setSubmitting(true)
    try {
      const payload: UpdatePatientInput = {
        email: form.email?.trim(),
        firstName: form.firstName?.trim(),
        lastName: form.lastName?.trim(),
        dateOfBirth: form.dateOfBirth?.trim(),
        patientType: form.patientType,
        careerId: form.careerId?.trim() || null,
        phone: form.phone?.trim() || undefined,
        enrollmentNumber: form.enrollmentNumber?.trim() || undefined,
        maritalStatus: form.maritalStatus || 'single',
        guardianName: form.guardianName?.trim() || undefined,
        guardianPhone: form.guardianPhone?.trim() || undefined,
        group: form.group?.trim() || undefined,
        occupation: form.occupation?.trim() || undefined,
      }
      const tri = form.trimesterStr?.trim() ? parseInt(form.trimesterStr, 10) : undefined
      if (tri !== undefined && !Number.isNaN(tri) && tri >= 1 && tri <= 12) payload.trimester = tri
      await updatePatient(id, payload)
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

  if (loading || !patient) {
    return (
      <div className="space-y-6">
        <LoadingModal open={true} message={t('common.loading')} />
        <Link to="/patients" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
          <ArrowLeft size={18} />
          {t('patients.list')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={submitting || careersLoading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          navigate(`/patients/${id}`, { replace: true })
        }}
        message={t('common.successSaved')}
      />

      <Link
        to={`/patients/${id}`}
        className="inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:underline"
      >
        <ArrowLeft size={18} aria-hidden />
        {t('patients.list')}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('patients.editPatient')}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('patients.formNewPatientDescription')}</p>
      </div>

      <GlassCard className="overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title={t('patients.formSectionPersonal')} icon={User}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="edit-patient-firstName" label={t('patients.firstName')} required error={fieldErrors.firstName}>
                <input
                  id="edit-patient-firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  className={`${inputBaseClass} ${fieldErrors.firstName ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  autoComplete="given-name"
                  aria-invalid={!!fieldErrors.firstName}
                />
              </Field>
              <Field id="edit-patient-lastName" label={t('patients.lastName')} required error={fieldErrors.lastName}>
                <input
                  id="edit-patient-lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  className={`${inputBaseClass} ${fieldErrors.lastName ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  autoComplete="family-name"
                  aria-invalid={!!fieldErrors.lastName}
                />
              </Field>
            </div>
            <Field id="edit-patient-dateOfBirth" label={t('patients.dateOfBirth')} required error={fieldErrors.dateOfBirth}>
              <input
                id="edit-patient-dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                className={`${inputBaseClass} ${fieldErrors.dateOfBirth ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                aria-invalid={!!fieldErrors.dateOfBirth}
              />
            </Field>
          </FormSection>

          <FormSection title={t('patients.formSectionTypeCareer')} icon={UserCircle}>
            <Field id="edit-patient-patientType" label={t('patients.type')} required error={fieldErrors.patientType}>
              <select
                id="edit-patient-patientType"
                value={form.patientType}
                onChange={(e) => update('patientType', e.target.value)}
                className={`${inputBaseClass} ${fieldErrors.patientType ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                aria-invalid={!!fieldErrors.patientType}
              >
                {PATIENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`patients.${type}`)}
                  </option>
                ))}
              </select>
            </Field>
            {isStudent ? (
              <Field id="edit-patient-careerId" label={t('patients.career')} required error={fieldErrors.careerId}>
                <select
                  id="edit-patient-careerId"
                  value={form.careerId ?? ''}
                  onChange={(e) => update('careerId', e.target.value)}
                  className={`${inputBaseClass} ${fieldErrors.careerId ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  disabled={careersLoading}
                  aria-invalid={!!fieldErrors.careerId}
                >
                  <option value="">{careersLoading ? t('common.loading') : t('patients.selectCareer')}</option>
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">{t('patients.careerNotRequiredForFacultyAdmin')}</p>
            )}
            {(isStudent || form.patientType === 'faculty' || form.patientType === 'administrative') && (
              <Field id="edit-patient-enrollmentNumber" label={isStudent ? t('patients.enrollment') : t('patients.employeeNumber')}>
                <input
                  id="edit-patient-enrollmentNumber"
                  type="text"
                  value={form.enrollmentNumber}
                  onChange={(e) => update('enrollmentNumber', e.target.value)}
                  className={inputBaseClass}
                  autoComplete="off"
                />
              </Field>
            )}
            {isStudent && (
              <>
                <Field id="edit-patient-group" label={t('patients.group')}>
                  <input
                    id="edit-patient-group"
                    type="text"
                    value={form.group}
                    onChange={(e) => update('group', e.target.value)}
                    className={inputBaseClass}
                    autoComplete="off"
                  />
                </Field>
                <Field id="edit-patient-trimester" label={t('patients.trimester')} hint="1-12">
                  <input
                    id="edit-patient-trimester"
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
              </>
            )}
          </FormSection>

          <FormSection title={t('patients.formSectionContact')} icon={Phone}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="edit-patient-email" label={<><Mail size={18} className="shrink-0 text-[var(--color-primary)]" aria-hidden />{t('patients.email')}</>} required error={fieldErrors.email}>
                <input
                  id="edit-patient-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={`${inputBaseClass} ${fieldErrors.email ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  autoComplete="email"
                  aria-invalid={!!fieldErrors.email}
                />
              </Field>
              <Field id="edit-patient-phone" label={<><span className="flex items-center gap-1.5 text-[#25D366]" aria-hidden><WhatsAppIcon className="h-4 w-4 shrink-0" /></span>{t('patients.whatsapp')}</>}>
                <input
                  id="edit-patient-phone"
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
            <Field id="edit-patient-maritalStatus" label={t('patients.maritalStatus')}>
              <select
                id="edit-patient-maritalStatus"
                value={form.maritalStatus}
                onChange={(e) => update('maritalStatus', e.target.value)}
                className={inputBaseClass}
              >
                {MARITAL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`patients.marital${status === 'common_law' ? 'CommonLaw' : status.charAt(0).toUpperCase() + status.slice(1)}`)}
                  </option>
                ))}
              </select>
            </Field>
          </FormSection>

          <FormSection title={t('patients.formSectionGuardian')} icon={Users}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="edit-patient-guardianName" label={t('patients.guardianName')}>
                <input id="edit-patient-guardianName" type="text" value={form.guardianName} onChange={(e) => update('guardianName', e.target.value)} className={inputBaseClass} autoComplete="off" />
              </Field>
              <Field id="edit-patient-guardianPhone" label={<><span className="flex items-center gap-1.5 text-[#25D366]" aria-hidden><WhatsAppIcon className="h-4 w-4 shrink-0" /></span>{t('patients.guardianPhone')}</>}>
                <input id="edit-patient-guardianPhone" type="tel" value={form.guardianPhone} onChange={(e) => update('guardianPhone', e.target.value)} className={inputBaseClass} autoComplete="tel" />
              </Field>
            </div>
          </FormSection>

          <FormSection title={t('patients.formSectionAcademic')} icon={Briefcase}>
            <Field id="edit-patient-occupation" label={t('patients.occupation')}>
              <input id="edit-patient-occupation" type="text" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className={inputBaseClass} autoComplete="organization-title" />
            </Field>
          </FormSection>

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
            <GlassButton type="submit" variant="primary" disabled={submitting || careersLoading} className="inline-flex items-center gap-2">
              <Save size={18} aria-hidden />
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to={`/patients/${id}`}>
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
