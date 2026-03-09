import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  User,
  UserCircle,
  Calendar,
  Clock,
  Building2,
  FileText,
  Stethoscope,
  Save,
  X,
} from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { getPatients } from '@/services/patient.service'
import {
  getAppointmentProfessionals,
  createAppointment,
  type CreateAppointmentInput,
  type AppointmentProfessional,
} from '@/services/appointment.service'
import type { Patient } from '@/types/patient'
import { DEPARTMENT_KEYS } from '@/types/appointment'

const DEPARTMENT_VALUES = ['psychology', 'nursing'] as const
const DURATION_OPTIONS = [30, 45, 50, 60, 90]

export function NewAppointmentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [professionals, setProfessionals] = useState<AppointmentProfessional[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [professionalsLoading, setProfessionalsLoading] = useState(true)
  const [form, setForm] = useState<CreateAppointmentInput>({
    patientId: '',
    professionalId: '',
    appointmentType: '',
    department: 'psychology',
    scheduledDate: '',
    durationMinutes: 50,
    notes: '',
  })

  useEffect(() => {
    getPatients({ limit: 200 })
      .then((r) => setPatients(r.patients))
      .catch(() => setPatients([]))
      .finally(() => setPatientsLoading(false))
  }, [])

  useEffect(() => {
    getAppointmentProfessionals()
      .then(setProfessionals)
      .catch(() => setProfessionals([]))
      .finally(() => setProfessionalsLoading(false))
  }, [])

  const update = (field: keyof CreateAppointmentInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (
      !form.patientId.trim() ||
      !form.professionalId.trim() ||
      !form.appointmentType.trim() ||
      !form.department ||
      !form.scheduledDate.trim() ||
      !form.durationMinutes
    ) {
      setError(t('appointments.requiredField'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateAppointmentInput = {
        patientId: form.patientId.trim(),
        professionalId: form.professionalId.trim(),
        appointmentType: form.appointmentType.trim(),
        department: form.department,
        scheduledDate: form.scheduledDate.trim(),
        durationMinutes: Number(form.durationMinutes),
      }
      if (form.notes?.trim()) payload.notes = form.notes.trim()
      const appointment = await createAppointment(payload)
      setCreatedId(appointment.id)
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

  const patientName = (p: Patient) => `${p.user.firstName} ${p.user.lastName}`.trim()
  const professionalName = (p: AppointmentProfessional) => `${p.firstName} ${p.lastName}`.trim()

  return (
    <div className="space-y-6">
      <LoadingModal open={submitting || patientsLoading || professionalsLoading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal open={showSuccess} onClose={() => { setShowSuccess(false); if (createdId) navigate(`/appointments/${createdId}`, { replace: true }); setCreatedId(null) }} message={t('common.successSaved')} />
      <Link to="/appointments" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('appointments.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('appointments.newAppointment')}</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <User size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('appointments.patient')} *
              </label>
              <select
                value={form.patientId}
                onChange={(e) => update('patientId', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
                disabled={patientsLoading}
              >
                <option value="">
                  {patientsLoading ? t('common.loading') : t('appointments.selectPatient')}
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {patientName(p)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <UserCircle size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('appointments.professional')} *
              </label>
              <select
                value={form.professionalId}
                onChange={(e) => update('professionalId', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
                disabled={professionalsLoading}
              >
                <option value="">
                  {professionalsLoading ? t('common.loading') : t('appointments.selectProfessional')}
                </option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {professionalName(p)} ({t(`roles.${p.role}`) || p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Calendar size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('appointments.date')} *
              </label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => update('scheduledDate', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Clock size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('appointments.duration')} *
              </label>
              <select
                value={form.durationMinutes}
                onChange={(e) => update('durationMinutes', Number(e.target.value))}
                className="glass-input w-full px-4 py-2.5"
                required
              >
                {DURATION_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} {t('appointments.minutes')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <FileText size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('appointments.type')} *
              </label>
              <input
                type="text"
                value={form.appointmentType}
                onChange={(e) => update('appointmentType', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                placeholder={t('appointments.typePlaceholder')}
                required
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <Building2 size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('appointments.department')} *
              </label>
              <select
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
                className="glass-input w-full px-4 py-2.5"
                required
              >
                {DEPARTMENT_VALUES.map((d) => (
                  <option key={d} value={d}>
                    {DEPARTMENT_KEYS[d] ? t(`appointments.${DEPARTMENT_KEYS[d]}`) : d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Stethoscope size={18} className="shrink-0 text-[var(--color-primary)]" />
              {t('appointments.notes')}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[80px]"
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <GlassButton
              type="submit"
              variant="primary"
              disabled={submitting || patientsLoading || professionalsLoading}
              className="inline-flex items-center gap-2"
            >
              <Save size={18} />
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/appointments">
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
