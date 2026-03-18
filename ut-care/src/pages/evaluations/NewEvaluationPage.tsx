import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, User } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { createPsychometricEvaluation } from '@/services/psychometric-evaluation.service'
import { getPatients } from '@/services/patient.service'
import { getMedicalRecordByPatientId, ensureExpedientForPatient } from '@/services/medical-record.service'
import type { CreatePsychometricEvaluationInput } from '@/types/psychometric-evaluation'
import type { Patient } from '@/types/patient'

/** Tipos de evaluación psicométrica (valor enviado al API = clave i18n o valor si no hay clave). */
const EVALUATION_TYPE_OPTIONS: { value: string; i18nKey?: string }[] = [
  { value: 'PHQ-9', i18nKey: 'evaluations.types.phq9' },
  { value: 'GAD-7', i18nKey: 'evaluations.types.gad7' },
  { value: 'BDI-II', i18nKey: 'evaluations.types.bdi2' },
  { value: 'Beck Depression Inventory', i18nKey: 'evaluations.types.bdi' },
  { value: 'Hamilton Anxiety Scale', i18nKey: 'evaluations.types.hamilton' },
  { value: 'MMPI-2', i18nKey: 'evaluations.types.mmpi2' },
  { value: 'SCL-90-R', i18nKey: 'evaluations.types.scl90' },
  { value: 'WAIS-IV', i18nKey: 'evaluations.types.wais4' },
  { value: 'Rorschach', i18nKey: 'evaluations.types.rorschach' },
  { value: 'other', i18nKey: 'evaluations.types.other' },
]

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

export function NewEvaluationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const psychologyRecordIdFromUrl = searchParams.get('psychologyRecordId') ?? ''

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false)
  const [selectedPatientLabel, setSelectedPatientLabel] = useState<string>('')
  const [loadingRecord, setLoadingRecord] = useState(false)
  const patientInputRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<
    CreatePsychometricEvaluationInput & { percentileStr: string; evaluationTypeOther: string }
  >({
    psychologyRecordId: psychologyRecordIdFromUrl,
    evaluationType: '',
    applicationDate: new Date().toISOString().split('T')[0],
    rawScore: '',
    standardScore: '',
    percentileStr: '',
    interpretation: '',
    fileUrl: '',
    evaluationTypeOther: '',
  })

  const update = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  useEffect(() => {
    const q = patientSearch.trim()
    setPatientsLoading(true)
    const timeout = setTimeout(() => {
      getPatients({ search: q || undefined, limit: 50 })
        .then((r) => setPatients(r.patients))
        .catch(() => setPatients([]))
        .finally(() => setPatientsLoading(false))
    }, q ? 300 : 0)
    return () => clearTimeout(timeout)
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
    return patients
      .filter(
        (p) =>
          p.user.firstName?.toLowerCase().includes(q) ||
          p.user.lastName?.toLowerCase().includes(q) ||
          patientName(p).toLowerCase().includes(q) ||
          p.user.enrollmentNumber?.toLowerCase().includes(q) ||
          p.user.email?.toLowerCase().includes(q) ||
          p.patientType?.toLowerCase().includes(q) ||
          p.career?.name?.toLowerCase().includes(q) ||
          p.career?.code?.toLowerCase().includes(q)
      )
      .slice(0, 25)
  }, [patients, patientSearch])

  const handleSelectPatient = async (p: Patient) => {
    setLoadingRecord(true)
    setError('')
    try {
      let record: Awaited<ReturnType<typeof getMedicalRecordByPatientId>>
      try {
        record = await getMedicalRecordByPatientId(p.id)
      } catch (firstErr: unknown) {
        const status =
          firstErr && typeof firstErr === 'object' && 'response' in firstErr
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
      ]
        .filter(Boolean)
        .join(' · ')
      setSelectedPatientLabel(label)
      setPatientSearch(label)
      setShowPatientSuggestions(false)
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'response' in err
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const effectiveType =
      form.evaluationType === 'other' ? form.evaluationTypeOther.trim() : form.evaluationType.trim()
    if (!form.psychologyRecordId.trim() || !effectiveType || !form.applicationDate) {
      setError(t('common.error'))
      return
    }
    setSubmitting(true)
    try {
      const payload: CreatePsychometricEvaluationInput = {
        psychologyRecordId: form.psychologyRecordId.trim(),
        evaluationType: effectiveType,
        applicationDate: form.applicationDate,
      }
      const rawNum = Number(form.rawScore)
      if (form.rawScore !== '' && !Number.isNaN(rawNum)) payload.rawScore = rawNum
      const stdNum = Number(form.standardScore)
      if (form.standardScore !== '' && !Number.isNaN(stdNum)) payload.standardScore = stdNum
      const p = form.percentileStr.trim()
      if (p !== '') {
        const percNum = parseInt(p, 10)
        if (!Number.isNaN(percNum) && percNum >= 0 && percNum <= 100) payload.percentile = percNum
      }
      if (form.interpretation?.trim()) payload.interpretation = form.interpretation.trim()
      const fileUrlTrimmed = form.fileUrl?.trim()
      if (fileUrlTrimmed) payload.fileUrl = fileUrlTrimmed
      const created = await createPsychometricEvaluation(payload)
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
      <LoadingModal open={submitting || loadingRecord} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error || undefined} onClose={() => setError('')} />
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          if (createdId) navigate(`/evaluations/${createdId}`, { replace: true })
          setCreatedId(null)
        }}
        message={t('common.successSaved')}
      />
      <Link to="/evaluations" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('evaluations.list')}
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('evaluations.newEvaluation')}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t('evaluations.newEvaluationDescription')}
        </p>
      </div>
      <GlassCard className="overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title={t('evaluations.patient')} icon={User}>
            <Field
              id="eval-patient-search"
              label={t('sessions.patientForSession')}
              required
              hint={t('sessions.patientSearchHint')}
            >
              <div ref={patientInputRef} className="relative">
                <input
                  id="eval-patient-search"
                  type="text"
                  value={patientSearch}
                  onChange={handlePatientSearchChange}
                  onFocus={handlePatientSearchFocus}
                  placeholder={
                    patientsLoading || loadingRecord ? t('common.loading') : t('sessions.patientSearchPlaceholder')
                  }
                  className={inputBaseClass}
                  disabled={loadingRecord}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={showPatientSuggestions}
                  aria-controls="eval-patient-suggestions"
                />
                {showPatientSuggestions && (
                  <ul
                    id="eval-patient-suggestions"
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
                              {[p.user.enrollmentNumber, t(`patients.${p.patientType}`), p.career?.name]
                                .filter(Boolean)
                                .join(' · ')}
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

          <FormSection title={t('evaluations.evaluationType')} icon={FileText}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="eval-type" label={t('evaluations.evaluationType')} required>
                <select
                  id="eval-type"
                  value={form.evaluationType}
                  onChange={(e) => update('evaluationType', e.target.value)}
                  className={inputBaseClass}
                  required
                  aria-required="true"
                >
                  <option value="">{t('evaluations.selectType')}</option>
                  {EVALUATION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.i18nKey ? t(opt.i18nKey) : opt.value}
                    </option>
                  ))}
                </select>
              </Field>
              {form.evaluationType === 'other' && (
                <Field id="eval-type-other" label={t('evaluations.evaluationTypeOther')} required>
                  <input
                    id="eval-type-other"
                    type="text"
                    value={form.evaluationTypeOther}
                    onChange={(e) => update('evaluationTypeOther', e.target.value)}
                    className={inputBaseClass}
                    placeholder={t('evaluations.evaluationTypeOtherPlaceholder')}
                  />
                </Field>
              )}
              <Field id="eval-applicationDate" label={t('evaluations.applicationDate')} required>
                <input
                  id="eval-applicationDate"
                  type="date"
                  value={form.applicationDate}
                  onChange={(e) => update('applicationDate', e.target.value)}
                  className={inputBaseClass}
                  required
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="eval-rawScore" label={t('evaluations.rawScore')}>
                <input
                  id="eval-rawScore"
                  type="text"
                  inputMode="decimal"
                  value={form.rawScore}
                  onChange={(e) => update('rawScore', e.target.value)}
                  className={inputBaseClass}
                />
              </Field>
              <Field id="eval-standardScore" label={t('evaluations.standardScore')}>
                <input
                  id="eval-standardScore"
                  type="text"
                  inputMode="decimal"
                  value={form.standardScore}
                  onChange={(e) => update('standardScore', e.target.value)}
                  className={inputBaseClass}
                />
              </Field>
              <Field id="eval-percentile" label={t('evaluations.percentile')}>
                <input
                  id="eval-percentile"
                  type="number"
                  min={0}
                  max={100}
                  value={form.percentileStr}
                  onChange={(e) => update('percentileStr', e.target.value)}
                  className={inputBaseClass}
                />
              </Field>
            </div>
            <Field id="eval-interpretation" label={t('evaluations.interpretation')}>
              <textarea
                id="eval-interpretation"
                value={form.interpretation}
                onChange={(e) => update('interpretation', e.target.value)}
                className={`${inputBaseClass} min-h-[100px] resize-y`}
                rows={3}
              />
            </Field>
            <Field id="eval-fileUrl" label={t('evaluations.fileUrl')}>
              <input
                id="eval-fileUrl"
                type="url"
                value={form.fileUrl}
                onChange={(e) => update('fileUrl', e.target.value)}
                className={inputBaseClass}
                placeholder="https://..."
              />
            </Field>
          </FormSection>

          <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
            <GlassButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </GlassButton>
            <Link to="/evaluations">
              <GlassButton type="button">{t('common.cancel')}</GlassButton>
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
