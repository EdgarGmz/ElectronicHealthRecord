import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle,
  X,
  StickyNote,
  CalendarCheck,
  User,
} from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { createTherapySession, getTherapySessions } from '@/services/therapy-session.service'
import { getMoods } from '@/services/mood.service'
import { getPatients } from '@/services/patient.service'
import { getMedicalRecordByPatientId, ensureExpedientForPatient } from '@/services/medical-record.service'
import { api } from '@/lib/api'
import type { CreateTherapySessionInput } from '@/types/therapy-session'
import type { Mood, MoodCategory } from '@/types/mood'
import type { Patient } from '@/types/patient'
import { APPOINTMENT_STATUS } from '@/types/appointment'

const DEFAULT_DURATION = 50

const inputBaseClass =
  'glass-input w-full rounded-xl px-4 py-2.5 transition focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2'
const textareaClass = `${inputBaseClass} min-h-[100px] resize-y`

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
  children,
  hint,
}: {
  id: string
  label: string
  required?: boolean
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
      {hint && <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}

export function NewSessionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const psychologyRecordIdFromUrl = searchParams.get('psychologyRecordId') ?? ''
  const patientIdFromUrl = searchParams.get('patientId') ?? ''
  const appointmentIdFromUrl = searchParams.get('appointmentId') ?? ''

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const [completedAt, setCompletedAt] = useState<Date | null>(null)
  const [moods, setMoods] = useState<Mood[]>([])
  const [moodsLoading, setMoodsLoading] = useState(true)
  const [selectedMoodCodes, setSelectedMoodCodes] = useState<string[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false)
  const [selectedPatientLabel, setSelectedPatientLabel] = useState<string>('')
  const [loadingRecord, setLoadingRecord] = useState(false)
  const patientInputRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<CreateTherapySessionInput & { sessionDurationStr: string }>({
    psychologyRecordId: psychologyRecordIdFromUrl,
    sessionNumber: 1,
    sessionDate: new Date().toISOString().slice(0, 10),
    sessionDurationStr: String(DEFAULT_DURATION),
    mood: '',
    evolutionNotes: '',
    patientProgress: '',
    assignedTasks: '',
    observations: '',
    nextSessionPlan: '',
  })

  useEffect(() => {
    getMoods()
      .then(setMoods)
      .catch(() => setMoods([]))
      .finally(() => setMoodsLoading(false))
  }, [])

  // Pre-cargar paciente desde URL (?patientId=xxx), p. ej. desde el dashboard "Iniciar" de una cita
  useEffect(() => {
    if (!patientIdFromUrl.trim()) return
    setLoadingRecord(true)
    setError('')
    const loadRecord = async () => {
      try {
        const record = await getMedicalRecordByPatientId(patientIdFromUrl)
        if (record?.psychologyRecord?.id) return record

        // Si ya existe el expediente médico pero aún no el de psicología, asegúralo y recarga.
        await ensureExpedientForPatient(patientIdFromUrl)
        return await getMedicalRecordByPatientId(patientIdFromUrl)
      } catch (firstErr: unknown) {
        const status =
          firstErr && typeof firstErr === 'object' && 'response' in firstErr
            ? (firstErr as { response?: { status?: number } }).response?.status
            : undefined

        if (status === 404) {
          await ensureExpedientForPatient(patientIdFromUrl)
          return await getMedicalRecordByPatientId(patientIdFromUrl)
        }
        throw firstErr
      }
    }

    loadRecord()
      .catch((firstErr: unknown) => {
        const status =
          firstErr && typeof firstErr === 'object' && 'response' in firstErr
            ? (firstErr as { response?: { status?: number } }).response?.status
            : undefined
        throw firstErr
      })
      .then((record) => {
        if (!record?.psychologyRecord?.id) {
          setError(t('sessions.noPsychologyRecord'))
          return
        }
        update('psychologyRecordId', record.psychologyRecord.id)
        const p = record.patient
        const label = [
          `${p.user.firstName} ${p.user.lastName}`.trim(),
          p.user.enrollmentNumber && `(${p.user.enrollmentNumber})`,
          p.patientType && t(`patients.${p.patientType}`),
        ].filter(Boolean).join(' · ')
        setSelectedPatientLabel(label)
        setPatientSearch(label)
      })
      .catch((err: unknown) => {
        const status =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined
        setError(status === 404 ? t('sessions.noExpedientYet') : t('sessions.couldNotLoadRecord'))
      })
      .finally(() => setLoadingRecord(false))
  }, [patientIdFromUrl, t])

  // Búsqueda de pacientes (debounce)
  useEffect(() => {
    const q = patientSearch.trim()
    setPatientsLoading(true)
    const t = setTimeout(() => {
      getPatients({ search: q || undefined, limit: 50 })
        .then((r) => setPatients(r.patients))
        .catch(() => setPatients([]))
        .finally(() => setPatientsLoading(false))
    }, q ? 300 : 0)
    return () => clearTimeout(t)
  }, [patientSearch])

  useEffect(() => {
    if (!showPatientSuggestions) return
    const onDocClick = (e: MouseEvent) => {
      if (patientInputRef.current?.contains(e.target as Node)) return
      setShowPatientSuggestions(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showPatientSuggestions])

  const patientName = (p: Patient) => `${p.user.firstName} ${p.user.lastName}`.trim()
  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase()
    if (!q) return patients.slice(0, 20)
    return patients.filter(
      (p) =>
        p.user.firstName?.toLowerCase().includes(q) ||
        p.user.lastName?.toLowerCase().includes(q) ||
        patientName(p).toLowerCase().includes(q) ||
        p.user.enrollmentNumber?.toLowerCase().includes(q) ||
        p.user.email?.toLowerCase().includes(q) ||
        p.patientType?.toLowerCase().includes(q) ||
        p.career?.name?.toLowerCase().includes(q) ||
        p.career?.code?.toLowerCase().includes(q)
    ).slice(0, 25)
  }, [patients, patientSearch])

  const handleSelectPatient = async (p: Patient) => {
    setLoadingRecord(true)
    setError('')
    try {
      let record: Awaited<ReturnType<typeof getMedicalRecordByPatientId>>
      try {
        record = await getMedicalRecordByPatientId(p.id)
      } catch (firstErr: unknown) {
        const status = firstErr && typeof firstErr === 'object' && 'response' in firstErr
          ? (firstErr as { response?: { status?: number } }).response?.status
          : undefined
        if (status === 404) {
          await ensureExpedientForPatient(p.id)
          record = await getMedicalRecordByPatientId(p.id)
        } else {
          throw firstErr
        }
      }
      if (!record.psychologyRecord?.id) {
        await ensureExpedientForPatient(p.id)
        record = await getMedicalRecordByPatientId(p.id)
        if (!record.psychologyRecord?.id) {
          setError(t('sessions.noPsychologyRecord'))
          setLoadingRecord(false)
          return
        }
      }
      update('psychologyRecordId', record.psychologyRecord.id)
      const label = [
        patientName(p),
        p.user.enrollmentNumber && `(${p.user.enrollmentNumber})`,
        p.patientType && t(`patients.${p.patientType}`),
      ].filter(Boolean).join(' · ')
      setSelectedPatientLabel(label)
      setPatientSearch(label)
      setShowPatientSuggestions(false)
    } catch (err: unknown) {
      const status = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined
      if (status === 404) {
        setError(t('sessions.noExpedientYet'))
      } else {
        setError(t('sessions.couldNotLoadRecord'))
      }
    } finally {
      setLoadingRecord(false)
    }
  }

  const handlePatientSearchFocus = () => setShowPatientSuggestions(true)
  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearch(e.target.value)
    if (!e.target.value.trim()) {
      update('psychologyRecordId', '')
      setSelectedPatientLabel('')
    }
    setShowPatientSuggestions(true)
  }

  // Sugerir siguiente número de sesión cuando hay expediente de psicología (con debounce)
  useEffect(() => {
    const recordId = form.psychologyRecordId.trim()
    if (!recordId || recordId.length < 10) return
    const t = setTimeout(() => {
      getTherapySessions({ psychologyRecordId: recordId, limit: 500 })
        .then(({ sessions }) => {
          const maxNum = sessions.length > 0
            ? Math.max(...sessions.map((s) => s.sessionNumber))
            : 0
          setForm((prev) => ({ ...prev, sessionNumber: maxNum + 1 }))
        })
        .catch(() => {})
    }, 400)
    return () => clearTimeout(t)
  }, [form.psychologyRecordId])

  const toggleMood = (code: string) => {
    setSelectedMoodCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
    setError('')
  }

  const update = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const doSubmit = async () => {
    setError('')
    const moodValue = selectedMoodCodes.join(',').trim()
    const duration = parseInt(form.sessionDurationStr, 10)
    const payload: CreateTherapySessionInput = {
      psychologyRecordId: form.psychologyRecordId.trim(),
      sessionNumber: form.sessionNumber,
      sessionDate: form.sessionDate,
      sessionDuration: duration,
      mood: moodValue,
    }
    if (form.evolutionNotes?.trim()) payload.evolutionNotes = form.evolutionNotes.trim()
    if (form.patientProgress?.trim()) payload.patientProgress = form.patientProgress.trim()
    if (form.assignedTasks?.trim()) payload.assignedTasks = form.assignedTasks.trim()
    if (form.observations?.trim()) payload.observations = form.observations.trim()
    if (form.nextSessionPlan?.trim()) payload.nextSessionPlan = form.nextSessionPlan.trim()
    const created = await createTherapySession(payload)

    // Si la sesión se inició desde una cita, marcamos la cita como "completada"
    // para que aparezca inmediatamente en la vista de "Citas".
    const appointmentId = appointmentIdFromUrl.trim()
    if (appointmentId) {
      try {
        await api.put(`/appointments/${appointmentId}`, { status: APPOINTMENT_STATUS.COMPLETED })
      } catch {
        // No bloqueamos la creación de la sesión: solo dejamos el error para que el usuario
        // sepa que la tabla de citas puede requerir actualización manual.
        setError(t('common.error'))
      }
    }
    setCompletedAt(new Date())
    setCreatedId(created.id)
    setShowSuccess(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const moodValue = selectedMoodCodes.join(',').trim()
    if (!form.psychologyRecordId.trim() || !moodValue) {
      setError(t('common.error'))
      return
    }
    const duration = parseInt(form.sessionDurationStr, 10)
    if (Number.isNaN(duration) || duration < 1) {
      setError(t('common.error'))
      return
    }
    if (!selectedPatientLabel?.trim()) {
      setError(t('common.error'))
      return
    }
    setShowConfirmFinish(true)
  }

  const handleConfirmFinish = () => {
    setSubmitting(true)
    doSubmit()
      .catch((err: unknown) => {
        const res = err && typeof err === 'object' && 'response' in err ? (err as { response?: { status?: number; data?: { message?: string } } }).response : null
        const msg = res?.data?.message ?? null
        const isDuplicateSession = res?.status === 409 || (typeof msg === 'string' && msg.toLowerCase().includes('already exists'))
        setError(isDuplicateSession ? t('sessions.sessionNumberAlreadyExists') : (msg || t('common.error')))
      })
      .finally(() => {
        setSubmitting(false)
        setShowConfirmFinish(false)
      })
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={submitting || loadingRecord} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <ConfirmModal
        open={showConfirmFinish}
        onClose={() => setShowConfirmFinish(false)}
        onConfirm={handleConfirmFinish}
        title={t('sessions.confirmFinishSessionTitle')}
        message={t('sessions.confirmFinishSessionMessage', { name: selectedPatientLabel || '' })}
        confirmLabel={t('sessions.finishSession')}
        confirming={submitting}
      />
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          setCompletedAt(null)
          if (createdId) navigate(`/sessions/${createdId}`, { replace: true })
          setCreatedId(null)
        }}
        message={completedAt && selectedPatientLabel
          ? t('sessions.successFinishSession', {
              name: selectedPatientLabel,
              datetime: completedAt.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' }),
            })
          : t('common.successSaved')}
      />

      <Link
        to="/sessions"
        className="inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:underline"
      >
        <ArrowLeft size={18} aria-hidden />
        {t('sessions.list')}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('sessions.newSession')}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t('sessions.newSessionDescription')}
        </p>
      </div>

      <GlassCard className="overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title={t('sessions.formSectionIdentification')} icon={FileText}>
            <Field
              id="session-patient-search"
              label={t('sessions.patientForSession')}
              required
              hint={t('sessions.patientSearchHint')}
            >
              <div ref={patientInputRef} className="relative">
                <input
                  id="session-patient-search"
                  type="text"
                  value={patientSearch}
                  onChange={handlePatientSearchChange}
                  onFocus={handlePatientSearchFocus}
                  placeholder={patientsLoading || loadingRecord ? t('common.loading') : t('sessions.patientSearchPlaceholder')}
                  className={inputBaseClass}
                  disabled={loadingRecord}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={showPatientSuggestions}
                  aria-controls="session-patient-suggestions"
                />
                {showPatientSuggestions && (
                  <ul
                    id="session-patient-suggestions"
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] shadow-lg backdrop-blur-xl"
                  >
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => (
                        <li
                          key={p.id}
                          role="option"
                          aria-selected={selectedPatientLabel === patientName(p)}
                          onClick={() => handleSelectPatient(p)}
                          className="cursor-pointer px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
                        >
                          <span className="font-medium">{patientName(p)}</span>
                          {(p.user.enrollmentNumber || p.patientType || p.career?.name) && (
                            <span className="ml-2 text-[var(--text-muted)]">
                              {[p.user.enrollmentNumber, t(`patients.${p.patientType}`), p.career?.name].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-[var(--text-muted)]">
                        {patientSearch.trim() ? t('sessions.noPatientResults') : t('sessions.typeToSearchPatient')}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </Field>
          </FormSection>

          <FormSection title={t('sessions.formSectionSessionData')} icon={Calendar}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="session-sessionNumber" label={t('sessions.sessionNumber')} required hint={t('sessions.sessionNumberHint')}>
                <input
                  id="session-sessionNumber"
                  type="number"
                  min={1}
                  value={form.sessionNumber}
                  readOnly
                  aria-readonly="true"
                  className={`${inputBaseClass} cursor-not-allowed bg-black/5 dark:bg-white/5`}
                />
              </Field>
              <Field id="session-sessionDate" label={t('sessions.date')} required>
                <input
                  id="session-sessionDate"
                  type="date"
                  value={form.sessionDate}
                  onChange={(e) => update('sessionDate', e.target.value)}
                  className={inputBaseClass}
                />
              </Field>
              <Field id="session-duration" label={`${t('sessions.duration')} (${t('sessions.minutes')})`}>
                <input
                  id="session-duration"
                  type="number"
                  min={1}
                  value={form.sessionDurationStr}
                  onChange={(e) => update('sessionDurationStr', e.target.value)}
                  className={inputBaseClass}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title={t('sessions.formSectionClinical')} icon={StickyNote}>
            <Field id="session-mood" label={t('sessions.mood')} required hint={t('sessions.moodMultipleHint')}>
              {moodsLoading ? (
                <p className="text-sm text-[var(--text-muted)]">{t('common.loading')}</p>
              ) : (
                <div className="space-y-4" role="group" aria-label={t('sessions.mood')}>
                  {(
                    [
                      'very_common',
                      'positive',
                      'common',
                      'social_load',
                      'disorientation',
                      'less_common',
                      'high_intensity',
                      'rare',
                    ] as MoodCategory[]
                  ).map((category) => {
                    const categoryMoods = moods.filter((m) => m.category === category)
                    if (categoryMoods.length === 0) return null
                    const categoryKeyMap: Record<MoodCategory, string> = {
                      very_common: 'sessions.moodCategoryVeryCommon',
                      positive: 'sessions.moodCategoryPositive',
                      common: 'sessions.moodCategoryCommon',
                      social_load: 'sessions.moodCategorySocialLoad',
                      disorientation: 'sessions.moodCategoryDisorientation',
                      less_common: 'sessions.moodCategoryLessCommon',
                      high_intensity: 'sessions.moodCategoryHighIntensity',
                      rare: 'sessions.moodCategoryRare',
                    }
                    const label = t(categoryKeyMap[category])
                    return (
                      <div key={category}>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                          {label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {categoryMoods.map((mood, index) => {
                            const isSelected = selectedMoodCodes.includes(mood.code)
                            return (
                              <button
                                key={mood.id}
                                type="button"
                                onClick={() => toggleMood(mood.code)}
                                className={`
                                  mood-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                                  transition-all duration-200 ease-out
                                  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
                                  ${isSelected
                                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                                    : 'bg-[var(--border)]/50 text-[var(--text-secondary)] hover:bg-[var(--border)]'
                                  }
                                `}
                                style={{ animationDelay: `${index * 40}ms` }}
                                aria-pressed={isSelected}
                                aria-label={`${mood.name}${isSelected ? ' (seleccionado)' : ''}`}
                              >
                                <span className="mood-emoji text-lg leading-none" aria-hidden>
                                  {mood.emoji}
                                </span>
                                <span>{mood.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Field>
            <Field id="session-evolutionNotes" label={t('sessions.evolutionNotes')}>
              <textarea
                id="session-evolutionNotes"
                value={form.evolutionNotes}
                onChange={(e) => update('evolutionNotes', e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </Field>
            <Field id="session-patientProgress" label={t('sessions.patientProgress')}>
              <textarea
                id="session-patientProgress"
                value={form.patientProgress}
                onChange={(e) => update('patientProgress', e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </Field>
            <Field id="session-assignedTasks" label={t('sessions.assignedTasks')}>
              <textarea
                id="session-assignedTasks"
                value={form.assignedTasks}
                onChange={(e) => update('assignedTasks', e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </Field>
            <Field id="session-observations" label={t('sessions.observations')}>
              <textarea
                id="session-observations"
                value={form.observations}
                onChange={(e) => update('observations', e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </Field>
          </FormSection>

          <FormSection title={t('sessions.formSectionFollowUp')} icon={CalendarCheck}>
            <Field id="session-nextSessionPlan" label={t('sessions.nextSessionPlan')}>
              <textarea
                id="session-nextSessionPlan"
                value={form.nextSessionPlan}
                onChange={(e) => update('nextSessionPlan', e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </Field>
          </FormSection>

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
            <GlassButton type="submit" variant="primary" disabled={submitting} className="inline-flex items-center gap-2">
              <CheckCircle size={18} aria-hidden />
              {submitting ? t('common.loading') : t('sessions.finishSession')}
            </GlassButton>
            <Link to="/sessions">
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
