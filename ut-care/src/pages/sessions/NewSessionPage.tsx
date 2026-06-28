import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useSearchParams, useBlocker } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Calendar,
  CheckCircle,
  X,
  StickyNote,
  CalendarCheck,
  Play,
  Pause,
  RotateCcw,
  Timer,
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
import { updateWaitingListStatus } from '@/services/appointment.service'

interface FlyingMood {
  id: string
  code: string
  name: string
  emoji: string
  startX: number
  startY: number
  targetX: number
  targetY: number
  width: number
  height: number
}

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
  const queueEntryIdFromUrl = searchParams.get('queueEntryId') ?? ''

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const [showReschedulePrompt, setShowReschedulePrompt] = useState(false)
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
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromUrl)
  const patientInputRef = useRef<HTMLDivElement>(null)

  const [flyingMoods, setFlyingMoods] = useState<FlyingMood[]>([])
  const [transitMoodCodes, setTransitMoodCodes] = useState<string[]>([])

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

  const isDirty = useMemo(() => {
    if (showSuccess) return false

    const initialDate = new Date().toISOString().slice(0, 10)
    const dateChanged = form.sessionDate !== initialDate
    const durationChanged = form.sessionDurationStr !== String(DEFAULT_DURATION)
    const hasNotes = (form.evolutionNotes ?? '').trim() !== ''
    const hasProgress = (form.patientProgress ?? '').trim() !== ''
    const hasTasks = (form.assignedTasks ?? '').trim() !== ''
    const hasObservations = (form.observations ?? '').trim() !== ''
    const hasNextPlan = (form.nextSessionPlan ?? '').trim() !== ''
    const hasMood = selectedMoodCodes.length > 0

    return dateChanged || durationChanged || hasNotes || hasProgress || hasTasks || hasObservations || hasNextPlan || hasMood
  }, [form, selectedMoodCodes, showSuccess])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = '¿Deseas salir sin guardar los cambios?'
        return '¿Deseas salir sin guardar los cambios?'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  useEffect(() => {
    let intervalId: any = null
    if (isTimerRunning) {
      intervalId = setInterval(() => {
        setSecondsElapsed((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isTimerRunning])

  const formatStopwatch = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    const parts = []
    if (hrs > 0) parts.push(String(hrs).padStart(2, '0'))
    parts.push(String(mins).padStart(2, '0'))
    parts.push(String(secs).padStart(2, '0'))

    return parts.join(':')
  }

  const currentDateLabel = useMemo(() => {
    const today = new Date()
    return today.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [])



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
      setSelectedPatientId(p.id)
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

  const handleMoodClick = (e: React.MouseEvent<HTMLButtonElement>, mood: Mood) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const targetElement = document.getElementById('selected-moods-container')
    
    if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect()
      
      const newFlying: FlyingMood = {
        id: `${mood.id}-${Date.now()}`,
        code: mood.code,
        name: mood.name,
        emoji: mood.emoji,
        startX: rect.left + window.scrollX,
        startY: rect.top + window.scrollY,
        targetX: targetRect.left + window.scrollX + (targetRect.width / 2) - (rect.width / 2),
        targetY: targetRect.top + window.scrollY + (targetRect.height / 2) - (rect.height / 2),
        width: rect.width,
        height: rect.height,
      }
      
      setFlyingMoods((prev) => [...prev, newFlying])
      setTransitMoodCodes((prev) => [...prev, mood.code])
      
      setTimeout(() => {
        setSelectedMoodCodes((prev) => [...prev, mood.code])
        setTransitMoodCodes((prev) => prev.filter((c) => c !== mood.code))
        setFlyingMoods((prev) => prev.filter((item) => item.id !== newFlying.id))
      }, 450)
    } else {
      toggleMood(mood.code)
    }
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

    const queueEntryId = queueEntryIdFromUrl.trim()
    if (queueEntryId) {
      try {
        await updateWaitingListStatus(queueEntryId, 'atendida')
      } catch (err) {
        console.error('Error updating queue status:', err)
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

  const handleSaveFromBlocker = () => {
    const moodValue = selectedMoodCodes.join(',').trim()
    if (!form.psychologyRecordId.trim() || !moodValue) {
      setError(t('common.error'))
      blocker.reset?.()
      return
    }
    const duration = parseInt(form.sessionDurationStr, 10)
    if (Number.isNaN(duration) || duration < 1) {
      setError(t('common.error'))
      blocker.reset?.()
      return
    }
    if (!selectedPatientLabel?.trim()) {
      setError(t('common.error'))
      blocker.reset?.()
      return
    }

    setSubmitting(true)
    doSubmit()
      .then(() => {
        blocker.reset?.()
      })
      .catch((err: unknown) => {
        const res = err && typeof err === 'object' && 'response' in err ? (err as { response?: { status?: number; data?: { message?: string } } }).response : null
        const msg = res?.data?.message ?? null
        const isDuplicateSession = res?.status === 409 || (typeof msg === 'string' && msg.toLowerCase().includes('already exists'))
        setError(isDuplicateSession ? t('sessions.sessionNumberAlreadyExists') : (msg || t('common.error')))
        blocker.reset?.()
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <div className="min-h-screen bg-mesh p-4 md:p-6 lg:p-8 space-y-6">
      {blocker.state === 'blocked' && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="unsaved-modal-title"
          aria-describedby="unsaved-modal-desc"
        >
          <div
            className="glass-card flex w-full max-w-md flex-col gap-6 rounded-2xl p-6 shadow-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center text-[var(--color-error)]">
                <FileText size={24} className="text-[var(--color-error)]" />
              </div>
              <h2
                id="unsaved-modal-title"
                className="text-lg font-bold text-[var(--text-primary)] font-sans"
              >
                {t('sessions.unsavedModalTitle', '¿Deseas salir sin guardar los cambios?')}
              </h2>
              <p
                id="unsaved-modal-desc"
                className="text-sm text-[var(--text-secondary)] font-sans"
              >
                {t('sessions.unsavedModalDesc', 'Has realizado cambios en la sesión de terapia que se perderán si abandonas esta página.')}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSaveFromBlocker}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-[var(--color-primary)] text-white hover:brightness-110 active:scale-95 transition-all shadow-md font-sans"
              >
                {t('sessions.unsavedModalSave', 'Guardar sesión')}
              </button>
              <button
                type="button"
                onClick={() => blocker.proceed?.()}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10 active:scale-95 transition-all font-sans"
              >
                {t('sessions.unsavedModalConfirmExit', 'Sí, salir sin guardar')}
              </button>
              <button
                type="button"
                onClick={() => blocker.reset?.()}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all font-sans"
              >
                {t('sessions.unsavedModalCancel', 'Cancelar')}
              </button>
            </div>
          </div>
        </div>
      )}
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
          setShowReschedulePrompt(true)
        }}
        message={completedAt && selectedPatientLabel
          ? t('sessions.successFinishSession', {
              name: selectedPatientLabel,
              datetime: completedAt.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' }),
            })
          : t('common.successSaved')}
      />

      <ConfirmModal
        open={showReschedulePrompt}
        onClose={() => {
          setShowReschedulePrompt(false)
          if (createdId) {
            navigate(`/sessions/${createdId}`, { replace: true })
          }
          setCreatedId(null)
        }}
        onConfirm={() => {
          setShowReschedulePrompt(false)
          // Redirigir a la pantalla de crear cita pre-cargando al paciente
          navigate(`/appointments/new?patientId=${encodeURIComponent(selectedPatientId || '')}`)
          setCreatedId(null)
        }}
        title="¿Deseas agendar la próxima cita?"
        message={`¿Deseas programar la siguiente sesión de seguimiento para ${selectedPatientLabel || 'el alumno'}?`}
        confirmLabel="Sí, agendar"
        cancelLabel="No, terminar"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('sessions.newSession')}</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t('sessions.newSessionDescription')}
          </p>
        </div>

        {/* Stopwatch and Date widget */}
        <div className="flex items-center gap-5 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-5 py-3 shadow-sm backdrop-blur-md self-start sm:self-auto font-sans">
          {/* Fecha */}
          <div className="flex items-center gap-2.5 border-r border-slate-200 dark:border-slate-800/80 pr-5 text-sm font-medium text-slate-700 dark:text-slate-300 font-sans">
            <Calendar size={17} className="text-[var(--color-primary)]" />
            <span>{currentDateLabel}</span>
          </div>
          
          {/* Cronómetro */}
          <div className="flex items-center gap-3.5 pl-1 font-sans">
            <div className="flex items-center gap-2 font-mono text-base font-bold text-slate-800 dark:text-slate-200 min-w-[85px]">
              <Timer size={17} className={`text-[var(--color-primary)] ${isTimerRunning ? 'animate-pulse' : ''}`} />
              <span>{formatStopwatch(secondsElapsed)}</span>
            </div>
            
            {/* Botones de control */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                title={isTimerRunning ? 'Pausar Cronómetro' : 'Iniciar Cronómetro'}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
              >
                {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false)
                  setSecondsElapsed(0)
                }}
                title="Reiniciar Cronómetro"
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" role="group" aria-label={t('sessions.mood')}>
                  
                  {/* SECCIÓN IZQUIERDA: BIBLIOTECA DE EMOCIONES EN CUADRÍCULA 4x2 */}
                  <div className="lg:col-span-9 space-y-3">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider font-sans mb-1">
                      Biblioteca de Emociones (Pasa el cursor sobre una categoría para desplegarla)
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        const unselectedMoods = categoryMoods.filter(
                          (m) => !selectedMoodCodes.includes(m.code) && !transitMoodCodes.includes(m.code)
                        )
                        
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
                          <div 
                            key={category} 
                            className="group relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/20 dark:bg-slate-950/10 backdrop-blur-sm transition-all duration-500 ease-in-out hover:shadow-lg hover:border-[var(--color-primary)]/30"
                          >
                            {/* Encabezado de la Tarjeta */}
                            <div className="flex items-center justify-between px-4 py-4.5">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-sans group-hover:text-[var(--color-primary)] transition-colors duration-300">
                                  {label}
                                </span>
                                {unselectedMoods.length > 0 ? (
                                  <span className="text-[10px] text-[var(--text-muted)] font-sans">
                                    {unselectedMoods.length} disponibles
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-green-500 font-semibold font-sans">
                                    Completadas
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Contenido Desplegable al Hover (Lentamente: duration-700) */}
                            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-in-out group-hover:grid-rows-[1fr]">
                              <div className="overflow-hidden">
                                <div className="px-4 pb-4.5 pt-1 border-t border-slate-200/20 dark:border-slate-800/20">
                                  {unselectedMoods.length === 0 ? (
                                    <p className="text-[11px] text-[var(--text-muted)] italic font-sans">
                                      Todas las emociones seleccionadas.
                                    </p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {unselectedMoods.map((mood) => (
                                        <button
                                          key={`library-${mood.id}`}
                                          type="button"
                                          onClick={(e) => handleMoodClick(e, mood)}
                                          className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 dark:border-slate-700/80 bg-white/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 text-xs font-medium transition-all duration-200 hover:scale-105 hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] font-sans"
                                          aria-label={`Seleccionar ${mood.name}`}
                                        >
                                          <span>{mood.emoji}</span>
                                          <span>{mood.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* SECCIÓN DERECHA: EMOCIONES CAPTURADAS / SELECCIONADAS */}
                  <div className="lg:col-span-3">
                    <div 
                      id="selected-moods-container"
                      className="lg:sticky lg:top-4 rounded-2xl border border-dashed border-[var(--border)] bg-black/[0.01] dark:bg-white/[0.01] p-4 min-h-[150px] flex flex-col transition-all duration-300"
                    >
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 font-sans">
                        Emociones Seleccionadas ({selectedMoodCodes.length})
                      </p>
                      
                      {selectedMoodCodes.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/10 dark:bg-slate-900/10">
                          <span className="text-2xl mb-2">💭</span>
                          <span className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                            Ninguna emoción seleccionada todavía. Haz clic en las emociones de la izquierda para agregarlas.
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedMoodCodes.map((code) => {
                            const m = moods.find((mood) => mood.code === code)
                            if (!m) return null
                            return (
                              <button
                                key={`selected-${m.id}`}
                                type="button"
                                onClick={() => toggleMood(m.code)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] text-white px-3.5 py-1.5 text-sm font-medium shadow-md transition-all duration-200 hover:bg-[var(--color-primary)]/90 hover:scale-95 animate-scale-in font-sans"
                                aria-label={`Remover ${m.name}`}
                              >
                                <span>{m.emoji}</span>
                                <span>{m.name}</span>
                                <X size={14} className="hover:text-red-200 transition-colors" />
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
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

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
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

      {/* Elementos voladores (animaciones) */}
      {flyingMoods.map((fm) => (
        <div
          key={fm.id}
          className="fixed z-[9999] pointer-events-none rounded-full bg-[var(--color-primary)] text-white px-3.5 py-1.5 text-sm font-medium shadow-md font-sans flex items-center gap-1.5 animate-fly-to-target"
          style={{
            left: fm.startX - window.scrollX,
            top: fm.startY - window.scrollY,
            width: fm.width,
            height: fm.height,
            '--target-x': `${fm.targetX - fm.startX}px`,
            '--target-y': `${fm.targetY - fm.startY}px`,
          } as React.CSSProperties}
        >
          <span>{fm.emoji}</span>
          <span>{fm.name}</span>
        </div>
      ))}

      {/* Estilos Inline para las animaciones premium */}
      <style>{`
        @keyframes flyToTarget {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          15% {
            transform: translate(0, 0) scale(0.85);
            opacity: 0.95;
          }
          85% {
            transform: translate(var(--target-x), var(--target-y)) scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: translate(var(--target-x), var(--target-y)) scale(0.4);
            opacity: 0;
          }
        }

        .animate-fly-to-target {
          animation: flyToTarget 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  )
}
