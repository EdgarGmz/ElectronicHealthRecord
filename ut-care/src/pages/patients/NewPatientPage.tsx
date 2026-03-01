import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  UserCircle,
  GraduationCap,
  Hash,
  Phone,
  Heart,
  Users,
  Briefcase,
  BookOpen,
  Save,
  X,
} from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { createPatient } from '@/services/patient.service'
import { getCareers } from '@/services/career.service'
import type { CreatePatientInput } from '@/services/patient.service'
import type { Career } from '@/types/career'

const PATIENT_TYPES = ['student', 'faculty', 'administrative'] as const
const MARITAL_STATUSES = ['single', 'married', 'separated', 'common_law'] as const

export function NewPatientPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
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
    getCareers()
      .then(setCareers)
      .catch(() => setError(t('common.error')))
      .finally(() => setCareersLoading(false))
  }, [t])

  const update = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth.trim() || !form.patientType || !form.careerId.trim()) {
      setError(t('patients.requiredField'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreatePatientInput = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth.trim(),
        patientType: form.patientType,
        careerId: form.careerId.trim(),
      }
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

  return (
    <div className="space-y-6">
      <LoadingModal open={submitting || careersLoading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal
        open={showSuccess}
        onClose={() => { setShowSuccess(false); if (createdPatientId) navigate(`/patients/${createdPatientId}`, { replace: true }); setCreatedPatientId(null) }}
        message={t('common.successSaved')}
      />
      <Link to="/patients" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('patients.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('patients.newPatient')}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <User size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.firstName')} *
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <User size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.lastName')} *
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Mail size={18} className="shrink-0 text-[var(--color-primary)]" />
              {t('patients.email')} *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              autoComplete="email"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Calendar size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.dateOfBirth')} *
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <UserCircle size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.type')} *
              </label>
              <select
                value={form.patientType}
                onChange={(e) => update('patientType', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              >
                {PATIENT_TYPES.map((type) => (
                  <option key={type} value={type}>{t(`patients.${type}`)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <GraduationCap size={18} className="shrink-0 text-[var(--color-primary)]" />
              {t('patients.career')} *
            </label>
            <select
              value={form.careerId}
              onChange={(e) => update('careerId', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
              required
              disabled={careersLoading}
            >
              <option value="">{careersLoading ? t('common.loading') : t('patients.selectCareer')}</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Hash size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.enrollment')}
              </label>
              <input
                type="text"
                value={form.enrollmentNumber}
                onChange={(e) => update('enrollmentNumber', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Phone size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.phone')}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Heart size={18} className="shrink-0 text-[var(--color-primary)]" />
              {t('patients.maritalStatus')}
            </label>
            <select
              value={form.maritalStatus}
              onChange={(e) => update('maritalStatus', e.target.value)}
              className="glass-input w-full px-4 py-2.5"
            >
              {MARITAL_STATUSES.map((status) => (
                <option key={status} value={status}>{t(`patients.marital${status === 'common_law' ? 'CommonLaw' : status.charAt(0).toUpperCase() + status.slice(1)}`)}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Users size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.guardianName')}
              </label>
              <input
                type="text"
                value={form.guardianName}
                onChange={(e) => update('guardianName', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Phone size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.guardianPhone')}
              </label>
              <input
                type="tel"
                value={form.guardianPhone}
                onChange={(e) => update('guardianPhone', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Users size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.group')}
              </label>
              <input
                type="text"
                value={form.group}
                onChange={(e) => update('group', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Briefcase size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.occupation')}
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => update('occupation', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
              />
            </div>
          </div>

          {form.patientType === 'student' && (
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <BookOpen size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('patients.trimester')}
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={form.trimesterStr}
                onChange={(e) => update('trimesterStr', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                placeholder="1-12"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            <GlassButton type="submit" variant="primary" disabled={submitting || careersLoading} className="inline-flex items-center gap-2">
              <Save size={18} />
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/patients">
              <GlassButton type="button" className="inline-flex items-center gap-2">
                <X size={18} />
                {t('common.cancel')}
              </GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
