import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  Save,
  X,
  UserPlus,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { getPatients } from '@/services/patient.service'
import { createAppointment, type CreateAppointmentInput } from '@/services/appointment.service'
import type { Patient } from '@/types/patient'

/** Fecha/hora mínima para `datetime-local` (hoy; hora actual redondeada al siguiente minuto). */
function getMinDateTimeLocal(): string {
  const d = new Date()
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)
  // Ajuste para que el string sea compatible con datetime-local (local-time representation)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const DURATION_OPTIONS = [30, 45, 50, 60, 90]

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function NewAppointmentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const userId = user?.id
  const minDateTimeLocal = useMemo(() => getMinDateTimeLocal(), [])
  const [error, setError] = useState('')
  const [showSlotConflictModal, setShowSlotConflictModal] = useState(false)
  const [conflictRange, setConflictRange] = useState<{ start?: string; end?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false)
  const patientInputRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState<CreateAppointmentInput>({
    patientId: '',
    professionalId: '',
    appointmentType: '',
    department: 'psychology', // Solo psicología genera citas
    scheduledDate: minDateTimeLocal,
    durationMinutes: 50,
    notes: '',
  })

  useEffect(() => {
    getPatients({ limit: 500 })
      .then((r) => setPatients(r.patients))
      .catch(() => setPatients([]))
      .finally(() => setPatientsLoading(false))
  }, [])

  useEffect(() => {
    if (userId) setForm((prev) => ({ ...prev, professionalId: userId }))
  }, [userId])

  const update = (field: keyof CreateAppointmentInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (
      !form.patientId.trim() ||
      !userId ||
      !form.appointmentType.trim() ||
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
        professionalId: userId,
        appointmentType: form.appointmentType.trim(),
        department: 'psychology',
        scheduledDate: form.scheduledDate.trim(),
        durationMinutes: Number(form.durationMinutes),
      }
      if (form.notes?.trim()) payload.notes = form.notes.trim()
      const appointment = await createAppointment(payload)
      setCreatedId(appointment.id)
      setShowSuccess(true)
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'response' in err ? (err as { response?: { status?: number } }).response?.status : null

      if (status === 409) {
        setError('')
        const conflictDetails =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { details?: { conflict?: { start?: string; end?: string } } } } }).response?.data?.details
            : null
        setConflictRange(conflictDetails?.conflict ? conflictDetails.conflict : null)
        setShowSlotConflictModal(true)
        return
      }

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

  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase()
    if (!q) return patients.slice(0, 15)
    return patients.filter(
      (p) =>
        p.user.firstName?.toLowerCase().includes(q) ||
        p.user.lastName?.toLowerCase().includes(q) ||
        patientName(p).toLowerCase().includes(q)
    ).slice(0, 15)
  }, [patients, patientSearch])

  useEffect(() => {
    if (!showPatientSuggestions) return
    const onDocClick = (e: MouseEvent) => {
      if (patientInputRef.current?.contains(e.target as Node)) return
      setShowPatientSuggestions(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showPatientSuggestions])

  const handleSelectPatient = (p: Patient) => {
    update('patientId', p.id)
    setPatientSearch(patientName(p))
    setShowPatientSuggestions(false)
  }

  const handlePatientSearchFocus = () => setShowPatientSuggestions(true)
  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearch(e.target.value)
    if (!e.target.value.trim()) update('patientId', '')
    setShowPatientSuggestions(true)
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={submitting || patientsLoading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <ErrorModal
        open={showSlotConflictModal}
        onClose={() => {
          setShowSlotConflictModal(false)
          setConflictRange(null)
        }}
        title={t('appointments.conflictTitle', 'Conflicto de horario')}
        message={
          conflictRange?.start && conflictRange?.end
            ? `${t('appointments.conflictMessage', 'Ya existe una cita agendada en esa hora.')} Horario ocupado: ${formatTime(conflictRange.start)} - ${formatTime(conflictRange.end)}`
            : t('appointments.conflictMessage', 'Ya existe una cita agendada en esa hora.')
        }
        closeLabel={t('common.close')}
      />
      <SuccessModal open={showSuccess} onClose={() => { setShowSuccess(false); if (createdId) navigate(`/appointments/${createdId}`, { replace: true }); setCreatedId(null) }} message={t('common.successSaved')} />
      <Link to="/appointments" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('appointments.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('appointments.newAppointment')}</h1>
      <GlassCard className="overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 opacity-0 profile-form-animate">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t('appointments.patient')}
            </h2>
            <div ref={patientInputRef} className="relative">
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <User size={18} className="shrink-0 text-[var(--color-primary)]" />
                {t('appointments.patient')} *
              </label>
              <input
                type="text"
                value={patientSearch}
                onChange={handlePatientSearchChange}
                onFocus={handlePatientSearchFocus}
                placeholder={patientsLoading ? t('common.loading') : t('appointments.searchPatientPlaceholder')}
                className="glass-input w-full px-4 py-2.5 rounded-lg transition focus:ring-2 focus:ring-[var(--color-primary)] pr-10"
                disabled={patientsLoading}
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showPatientSuggestions}
                aria-controls="patient-suggestions-list"
                id="patient-search-input"
              />
              {form.patientId && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-label={t('common.cancel', 'Cancelar')}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    update('patientId', '')
                    setPatientSearch('')
                    setShowPatientSuggestions(false)
                  }}
                >
                  <X size={16} aria-hidden />
                </button>
              )}
              <input type="hidden" name="patientId" value={form.patientId} />
              {showPatientSuggestions && (
                <ul
                  id="patient-suggestions-list"
                  role="listbox"
                  className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] shadow-lg backdrop-blur-xl"
                >
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => (
                      <li
                        key={p.id}
                        role="option"
                        aria-selected={form.patientId === p.id}
                        onClick={() => handleSelectPatient(p)}
                        className="cursor-pointer px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
                      >
                        {patientName(p)}
                        {p.user.enrollmentNumber && (
                          <span className="ml-2 text-[var(--text-muted)]">
                            ({p.user.enrollmentNumber})
                          </span>
                        )}
                      </li>
                    ))
                  ) : null}
                  {patientSearch.trim() && (
                    <li
                      role="option"
                      className="border-t border-[var(--border)] bg-[var(--bg)]/50"
                    >
                      <Link
                        to="/patients/new?from=appointments/new"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
                        onClick={() => setShowPatientSuggestions(false)}
                      >
                        <UserPlus size={16} className="shrink-0" />
                        {filteredPatients.length === 0
                          ? t('appointments.noResultsCreateNew')
                          : t('appointments.createNewPatient')}
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-4 border-t border-[var(--border)] pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t('appointments.dateAndDuration')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <Calendar size={18} className="shrink-0 text-[var(--color-primary)]" />
                  {t('appointments.date')} *
                </label>
                <div className="relative flex items-center rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-offset-0 focus-within:border-[var(--color-primary)]/50">
                  <span className="flex shrink-0 items-center justify-center pl-3 text-[var(--color-primary)]" aria-hidden>
                    <Calendar size={20} strokeWidth={2} />
                  </span>
                  <input
                    type="datetime-local"
                    value={form.scheduledDate}
                    onChange={(e) => update('scheduledDate', e.target.value)}
                    min={getMinDateTimeLocal()}
                    className="calendar-picker-icon-white min-h-[42px] flex-1 rounded-r-lg border-0 bg-transparent py-2.5 pr-3 pl-2 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] [color-scheme:inherit]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <Clock size={18} className="shrink-0 text-[var(--color-primary)]" />
                  {t('appointments.duration')} *
                </label>
                <select
                  value={form.durationMinutes}
                  onChange={(e) => update('durationMinutes', Number(e.target.value))}
                  className="glass-input w-full px-4 py-2.5 rounded-lg transition focus:ring-2 focus:ring-[var(--color-primary)]"
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
          </section>

          <section className="space-y-4 border-t border-[var(--border)] pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {t('appointments.typeOfAppointment')}
            </h2>
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
                  className="glass-input w-full px-4 py-2.5 rounded-lg transition focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder={t('appointments.typePlaceholder')}
                  list="appointment-types"
                  required
                />
                <datalist id="appointment-types">
                  <option value={t('appointments.typeFirstVisit')} />
                  <option value={t('appointments.typeFollowUp')} />
                  <option value={t('appointments.typeEvaluation')} />
                  <option value={t('appointments.typeCrisis')} />
                </datalist>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-[var(--border)] pt-4">
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Stethoscope size={18} className="shrink-0 text-[var(--color-primary)]" />
              {t('appointments.notes')}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="glass-input w-full px-4 py-2.5 min-h-[88px] rounded-lg transition focus:ring-2 focus:ring-[var(--color-primary)]"
              rows={3}
              placeholder={t('appointments.notesPlaceholder')}
            />
          </section>

          <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
            <GlassButton
              type="submit"
              variant="primary"
              disabled={submitting || patientsLoading || !userId}
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
