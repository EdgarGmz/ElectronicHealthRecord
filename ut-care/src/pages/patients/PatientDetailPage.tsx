import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Mail,
  Hash,
  Phone,
  BookOpen,
  Calendar,
  Activity,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { EmailLink } from '@/components/atoms/EmailLink'
import { GlassCard } from '@/components/atoms/GlassCard'
import { PhoneWhatsAppLink } from '@/components/atoms/PhoneWhatsAppLink'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { getPatientById } from '@/services/patient.service'
import { getTherapySessions } from '@/services/therapy-session.service'
import { getAppointments } from '@/services/appointment.service'
import { getMedicalRecordByPatientId } from '@/services/medical-record.service'
import { getMoods } from '@/services/mood.service'
import { getMyNursingAttentions, getNursingAttentionById } from '@/services/nursing-attention-list.service'
import type { NursingAttentionDetail } from '@/services/nursing-attention-list.service'
import { getNursingProcedures, getNursingProcedureById } from '@/services/nursing-procedure.service'
import { getTherapySessionById } from '@/services/therapy-session.service'
import { getAppointmentById } from '@/services/appointment.service'
import { canAccessExpedient } from '@/constants/roles'
import { useAuthStore } from '@/store/auth.store'
import type { Patient } from '@/types/patient'
import type { TherapySession } from '@/types/therapy-session'
import type { Appointment } from '@/types/appointment'
import type { MedicalRecord, NursingConsultation } from '@/types/medical-record'
import type { Mood } from '@/types/mood'
import type { NursingProcedure } from '@/types/nursing-procedure'
import type { NursingAttentionListItem } from '@/services/nursing-attention-list.service'
import { ROLES } from '@/constants/roles'

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#22c55e', '#eab308', '#ef4444']

function formatDateShort(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return value
  }
}

function groupSessionsByMonth(sessions: TherapySession[]): { month: string; count: number }[] {
  const byMonth = new Map<string, number>()
  for (const s of sessions) {
    const d = new Date(s.sessionDate)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1)
  }
  return Array.from(byMonth.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
}

function groupAppointmentsByStatus(appointments: Appointment[]): { name: string; value: number; status: string }[] {
  const byStatus = new Map<string, number>()
  for (const a of appointments) {
    const status = a.status || 'unknown'
    byStatus.set(status, (byStatus.get(status) ?? 0) + 1)
  }
  return Array.from(byStatus.entries()).map(([status, value]) => ({
    status,
    value,
    name: status,
  }))
}

function groupMoodCount(sessions: TherapySession[]): { mood: string; count: number }[] {
  const byMood = new Map<string, number>()
  for (const s of sessions) {
    const raw = s.mood?.trim() || ''
    if (!raw) {
      byMood.set('—', (byMood.get('—') ?? 0) + 1)
      continue
    }
    const codes = raw.split(',').map((c) => c.trim()).filter(Boolean)
    if (codes.length === 0) byMood.set('—', (byMood.get('—') ?? 0) + 1)
    else for (const code of codes) byMood.set(code, (byMood.get(code) ?? 0) + 1)
  }
  return Array.from(byMood.entries())
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

const RISK_LEVELS_ALERT = ['high', 'medium']

function nursingRecurrencesLast6Months(consultations: NursingConsultation[]): number {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return consultations.filter((c) => new Date(c.consultationDate) >= sixMonthsAgo).length
}

function nursingAlertCount(record: MedicalRecord | null): number {
  if (!record) return 0
  let n = 0
  if (record.allergies?.trim()) n += 1
  const pr = record.psychologyRecord
  if (pr) {
    if (RISK_LEVELS_ALERT.includes(pr.suicideRiskLevel?.toLowerCase())) n += 1
    if (RISK_LEVELS_ALERT.includes(pr.violenceRiskLevel?.toLowerCase())) n += 1
  }
  return n
}

function nurseName(c: NursingConsultation): string {
  const u = c.nurse
  return u ? `${u.firstName} ${u.lastName}`.trim() : '—'
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <p className="mt-0.5 whitespace-pre-wrap text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null)
  const [nursingAttentions, setNursingAttentions] = useState<NursingAttentionListItem[]>([])
  const [nursingProcedures, setNursingProcedures] = useState<NursingProcedure[]>([])
  const [historyModalType, setHistoryModalType] = useState<'attention' | 'procedure' | 'consultation' | 'session' | 'appointment' | null>(null)
  const [historyModalLoading, setHistoryModalLoading] = useState(false)
  const [detailAttention, setDetailAttention] = useState<NursingAttentionDetail | null>(null)
  const [detailProcedure, setDetailProcedure] = useState<NursingProcedure | null>(null)
  const [detailConsultation, setDetailConsultation] = useState<NursingConsultation | null>(null)
  const [detailSession, setDetailSession] = useState<TherapySession | null>(null)
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moods, setMoods] = useState<Mood[]>([])
  const [expedientTab, setExpedientTab] = useState<'psychology' | 'medical'>('psychology')

  const role = user?.role?.toLowerCase()?.trim()
  const isCoordinatorPsychology = role === ROLES.COORDINADOR_PSICOLOGIA
  const isCoordinatorNursing = role === ROLES.COORDINADOR_ENFERMERIA
  const isNurse = role === ROLES.ENFERMERO
  const isNursingRole = isCoordinatorNursing || isNurse
  const showExpedient = canAccessExpedient(user?.role)
  // Mostrar historial siempre que haya paciente cargado (la ruta /patients/:id ya está protegida por rol)
  const showHistory = !!id && !!patient

  useEffect(() => {
    getMoods().then(setMoods).catch(() => setMoods([]))
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getPatientById(id)
      .then(setPatient)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  useEffect(() => {
    if (!id || !showHistory) return
    setHistoryLoading(true)
    if (isNursingRole) {
      Promise.all([
        getMedicalRecordByPatientId(id).catch(() => null),
        getMyNursingAttentions({ patientId: id }),
        getNursingProcedures({ patientId: id, limit: 100 }),
      ])
        .then(([record, attentions, procRes]) => {
          setMedicalRecord(record ?? null)
          setNursingAttentions(attentions)
          setNursingProcedures(procRes.procedures)
        })
        .catch(() => {
          setMedicalRecord(null)
          setNursingAttentions([])
          setNursingProcedures([])
        })
        .finally(() => setHistoryLoading(false))
      return
    }
    // Psicología: cargar sesiones/citas y también datos de enfermería para la pestaña Historial Médico
    Promise.all([
      getTherapySessions({ patientId: id, limit: 200 }),
      getAppointments({ patientId: id, limit: 200 }),
      getMedicalRecordByPatientId(id).catch(() => null),
      getMyNursingAttentions({ patientId: id }).catch(() => []),
      getNursingProcedures({ patientId: id, limit: 100 }).then((r) => r.procedures).catch(() => []),
    ])
      .then(([sessRes, apptRes, record, attentions, procedures]) => {
        setSessions(sessRes.sessions)
        setAppointments(apptRes.appointments)
        setMedicalRecord(record ?? null)
        setNursingAttentions(attentions)
        setNursingProcedures(procedures)
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [id, showHistory, isNursingRole])

  const sessionsByMonth = useMemo(() => groupSessionsByMonth(sessions), [sessions])
  const appointmentsByStatus = useMemo(() => groupAppointmentsByStatus(appointments), [appointments])
  const moodData = useMemo(() => groupMoodCount(sessions), [sessions])
  const moodByCode = useMemo(() => new Map(moods.map((m) => [m.code, m])), [moods])
  const moodDataWithEmoji = useMemo(() => {
    const maxCount = moodData.length > 0 ? Math.max(...moodData.map((d) => d.count)) : 1
    return moodData.map((d) => {
      const m = moodByCode.get(d.mood)
      return {
        code: d.mood,
        name: m?.name ?? d.mood,
        emoji: m?.emoji ?? '•',
        count: d.count,
        maxCount,
      }
    })
  }, [moodData, moodByCode])

  const statusLabel = (status: string) => {
    const keyMap: Record<string, string> = {
      scheduled: 'appointments.statusScheduled',
      confirmed: 'appointments.statusConfirmed',
      completed: 'appointments.statusCompleted',
      cancelled: 'appointments.statusCancelled',
      'no-show': 'appointments.statusNoShow',
    }
    const key = keyMap[status] ?? status
    const translated = t(key)
    return typeof translated === 'string' ? translated : status
  }

  const allSessionsSorted = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()),
    [sessions]
  )
  const lastAppointments = useMemo(
    () => [...appointments].sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()).slice(0, 5),
    [appointments]
  )

  const closeHistoryModal = () => {
    setHistoryModalType(null)
    setHistoryModalLoading(false)
    setDetailAttention(null)
    setDetailProcedure(null)
    setDetailConsultation(null)
    setDetailSession(null)
    setDetailAppointment(null)
  }

  const openAttentionModal = (attentionId: string) => {
    setHistoryModalType('attention')
    setDetailAttention(null)
    setHistoryModalLoading(true)
    getNursingAttentionById(attentionId)
      .then(setDetailAttention)
      .catch(() => setDetailAttention(null))
      .finally(() => setHistoryModalLoading(false))
  }

  const openProcedureModal = (procedureId: string) => {
    setHistoryModalType('procedure')
    setDetailProcedure(null)
    setHistoryModalLoading(true)
    getNursingProcedureById(procedureId)
      .then(setDetailProcedure)
      .catch(() => setDetailProcedure(null))
      .finally(() => setHistoryModalLoading(false))
  }

  const openConsultationModal = (c: NursingConsultation) => {
    setHistoryModalType('consultation')
    setDetailConsultation(c)
  }

  const openSessionModal = (sessionId: string) => {
    setHistoryModalType('session')
    setDetailSession(null)
    setHistoryModalLoading(true)
    getTherapySessionById(sessionId)
      .then(setDetailSession)
      .catch(() => setDetailSession(null))
      .finally(() => setHistoryModalLoading(false))
  }

  const openAppointmentModal = (appointmentId: string) => {
    setHistoryModalType('appointment')
    setDetailAppointment(null)
    setHistoryModalLoading(true)
    getAppointmentById(appointmentId)
      .then(setDetailAppointment)
      .catch(() => setDetailAppointment(null))
      .finally(() => setHistoryModalLoading(false))
  }

  const fullName = patient ? `${patient.user.firstName} ${patient.user.lastName}`.trim() : ''
  const initial = [patient?.user.firstName?.[0], patient?.user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-10 pt-2 sm:px-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('patients.noPatients')} onClose={() => setError(null)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/patients"
          className="inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:underline"
        >
          <ArrowLeft size={18} />
          {t('patients.list')}
        </Link>
      </div>

      {!patient && !loading && (
        <GlassCard className="rounded-2xl">
          <p className="text-[var(--text-secondary)]">{t('patients.noPatients')}</p>
        </GlassCard>
      )}

      {patient && (
        <>
          {/* Hero */}
          <GlassCard className="overflow-hidden rounded-2xl border border-[var(--border)] p-6 transition-shadow hover:shadow-lg sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-3xl font-semibold text-white shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)',
                }}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">{fullName}</h1>
                <p className="mt-2 text-[var(--text-secondary)]">
                  {t(`patients.${patient.patientType}`) || patient.patientType}{patient.career ? ` · ${patient.career.name}` : ''}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <GlassCard className="rounded-2xl p-5 transition-shadow hover:shadow-md">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Mail size={18} className="text-[var(--color-primary)]" />
                {t('patients.email')}
              </h2>
              <p className="text-[var(--text-secondary)]">
                <EmailLink email={patient.user.email} />
              </p>
            </GlassCard>
            <GlassCard className="rounded-2xl p-5 transition-shadow hover:shadow-md">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Phone size={18} className="text-[var(--color-primary)]" />
                {t('patients.phone')}
              </h2>
              <p className="text-[var(--text-secondary)]">
                {patient.user.phone ? (
                  <PhoneWhatsAppLink phone={patient.user.phone} />
                ) : (
                  '—'
                )}
              </p>
            </GlassCard>
            <GlassCard className="rounded-2xl p-5 transition-shadow hover:shadow-md">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Hash size={18} className="text-[var(--color-primary)]" />
                {t('patients.enrollment')}
              </h2>
              <p className="text-[var(--text-secondary)]">{patient.user.enrollmentNumber ?? '—'}</p>
            </GlassCard>
          </div>

          {/* Expedient (solo roles con permiso) */}
          {showExpedient && (
            <GlassCard className="rounded-2xl p-5 transition-shadow hover:shadow-md">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <BookOpen size={18} className="text-[var(--color-primary)]" />
                {t('expedient.title')}
              </h2>
              <p className="mb-4 text-sm text-[var(--text-secondary)]">{t('expedient.subtitle')}</p>
              <Link to={`/patients/${id}/expedient`}>
                <GlassButton variant="primary" className="inline-flex gap-2 transition-transform hover:scale-[1.02]">
                  <BookOpen size={18} />
                  {t('patients.viewRecord')}
                </GlassButton>
              </Link>
            </GlassCard>
          )}

          {/* Expediente Médico: enfermería solo Historial Médico; psicología pestañas Historial Psicológico | Historial Médico */}
          {showHistory && (
            <section className="space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                    <Activity size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('expedient.title')}</h2>
                    <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                      {isNursingRole ? t('patients.nursingHistoryTitle') : t('patients.sessionsOverTime')}
                    </p>
                  </div>
                </div>
                {!isNursingRole && !historyLoading && (
                  <div className="flex rounded-xl border border-[var(--border)] bg-[var(--bg)]/30 p-1">
                    <button
                      type="button"
                      onClick={() => setExpedientTab('psychology')}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        expedientTab === 'psychology'
                          ? 'bg-[var(--color-primary)] text-white shadow'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg)]/50 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {t('patients.expedientTabPsychology')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpedientTab('medical')}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        expedientTab === 'medical'
                          ? 'bg-[var(--color-primary)] text-white shadow'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg)]/50 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {t('patients.expedientTabMedical')}
                    </button>
                  </div>
                )}
              </div>

              {historyLoading && (
                <div className="flex h-32 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)]/50">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                </div>
              )}

              {/* Contenido Historial Médico: enfermería siempre; psicología cuando pestaña "Historial Médico" */}
              {(isNursingRole || expedientTab === 'medical') && !historyLoading && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <GlassCard className="rounded-2xl border-l-4 border-l-[var(--color-primary)] transition-shadow hover:shadow-md">
                      <p className="text-sm font-medium text-[var(--text-muted)]">{t('patients.quickAttentions')}</p>
                      <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{nursingAttentions.length}</p>
                    </GlassCard>
                    <GlassCard className="rounded-2xl border-l-4 border-l-[#06b6d4] transition-shadow hover:shadow-md">
                      <p className="text-sm font-medium text-[var(--text-muted)]">{t('patients.lastProcedures')}</p>
                      <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{nursingProcedures.length}</p>
                    </GlassCard>
                    <GlassCard className="rounded-2xl border-l-4 border-l-[#eab308] transition-shadow hover:shadow-md">
                      <p className="text-sm font-medium text-[var(--text-muted)]">{t('patients.nursingVisits')}</p>
                      <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{medicalRecord?.nursingConsultations?.length ?? 0}</p>
                    </GlassCard>
                  </div>

                  <GlassCard className="rounded-2xl p-6 transition-shadow hover:shadow-md">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                      <Activity size={20} />
                      {t('patients.quickAttentions')}
                    </h3>
                    {nursingAttentions.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">{t('patients.noHistoryData')}</p>
                    ) : (
                      <ul className="max-h-[240px] space-y-2 overflow-y-auto">
                        {[...nursingAttentions]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 15)
                          .map((a) => (
                            <li
                              key={a.id}
                              role="button"
                              tabIndex={0}
                              className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)]/30 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/30"
                              onClick={() => openAttentionModal(a.id)}
                              onKeyDown={(e) => e.key === 'Enter' && openAttentionModal(a.id)}
                            >
                              <span className="max-w-[60%] truncate text-[var(--text-primary)]" title={a.motive}>{a.motive}</span>
                              <span className="text-[var(--text-muted)]">{formatDateShort(a.createdAt)}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </GlassCard>

                  <GlassCard className="rounded-2xl p-6 transition-shadow hover:shadow-md">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                      <Activity size={20} />
                      {t('patients.lastProcedures')}
                    </h3>
                    {nursingProcedures.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">{t('patients.noHistoryData')}</p>
                    ) : (
                      <ul className="max-h-[240px] space-y-2 overflow-y-auto">
                        {[...nursingProcedures]
                          .sort((a, b) => new Date(b.procedureDate).getTime() - new Date(a.procedureDate).getTime())
                          .slice(0, 15)
                          .map((p) => (
                            <li
                              key={p.id}
                              role="button"
                              tabIndex={0}
                              className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)]/30 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/30"
                              onClick={() => openProcedureModal(p.id)}
                              onKeyDown={(e) => e.key === 'Enter' && openProcedureModal(p.id)}
                            >
                              <span className="font-medium text-[var(--text-primary)]">{p.procedureType}</span>
                              <span className="text-[var(--text-muted)]">{formatDateShort(p.procedureDate)}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </GlassCard>

                  <GlassCard className="rounded-2xl p-6 transition-shadow hover:shadow-md">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                      <Activity size={20} />
                      {t('patients.lastNursingConsultations')}
                    </h3>
                    {(medicalRecord?.nursingConsultations?.length ?? 0) === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">{t('expedient.noNursingConsultations')}</p>
                    ) : (
                      <ul className="space-y-2">
                        {[...(medicalRecord?.nursingConsultations ?? [])]
                          .sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())
                          .slice(0, 10)
                          .map((c) => (
                            <li
                              key={c.id}
                              role="button"
                              tabIndex={0}
                              className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)]/30 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/30"
                              onClick={() => openConsultationModal(c)}
                              onKeyDown={(e) => e.key === 'Enter' && openConsultationModal(c)}
                            >
                              <span className="text-[var(--text-primary)]">{formatDateShort(c.consultationDate)} · {nurseName(c)}</span>
                              {c.chiefComplaint && (
                                <span className="max-w-[50%] truncate text-[var(--text-muted)]" title={c.chiefComplaint}>{c.chiefComplaint}</span>
                              )}
                            </li>
                          ))}
                      </ul>
                    )}
                  </GlassCard>
                </>
              )}

              {/* Contenido Historial Psicológico: solo roles de psicología y pestaña activa */}
              {!isNursingRole && expedientTab === 'psychology' && !historyLoading && (sessions.length > 0 || appointments.length > 0) && (
                <>
                  {/* KPI cards */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <GlassCard className="rounded-2xl border-l-4 border-l-[var(--color-primary)] p-5 transition-shadow hover:shadow-md">
                      <p className="text-sm font-medium text-[var(--text-muted)]">{t('patients.totalSessions')}</p>
                      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{sessions.length}</p>
                    </GlassCard>
                    <GlassCard className="rounded-2xl border-l-4 border-l-[#06b6d4] p-5 transition-shadow hover:shadow-md">
                      <p className="text-sm font-medium text-[var(--text-muted)]">{t('patients.totalAppointments')}</p>
                      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{appointments.length}</p>
                    </GlassCard>
                  </div>

                  {/* Sessions over time */}
                  {sessionsByMonth.length > 0 && (
                    <GlassCard className="rounded-2xl p-6 transition-shadow hover:shadow-md sm:p-8">
                      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                        <BarChart3 size={20} className="text-[var(--color-primary)]" />
                        {t('patients.sessionsOverTime')}
                      </h3>
                      <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sessionsByMonth} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--glass-bg)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                              }}
                              formatter={(value: number) => [value, t('patients.totalSessions')]}
                              labelFormatter={(label) => label}
                            />
                            <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name={t('patients.totalSessions')} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  )}

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Appointments by status */}
                    {appointmentsByStatus.length > 0 && (
                      <GlassCard className="rounded-2xl p-6 transition-shadow hover:shadow-md sm:p-8">
                        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                          <Calendar size={20} className="text-[var(--color-primary)]" />
                          {t('patients.appointmentsByStatus')}
                        </h3>
                        <div className="h-[220px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={appointmentsByStatus.map((d) => ({ ...d, name: statusLabel(d.status) }))}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={72}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {appointmentsByStatus.map((_, i) => (
                                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'var(--glass-bg)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '8px',
                                }}
                                formatter={(value: number, name: string) => [value, name]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </GlassCard>
                    )}

                    {/* Mood distribution: emojis + bar */}
                    {moodDataWithEmoji.length > 0 && (
                      <GlassCard className="rounded-2xl p-6 transition-shadow hover:shadow-md sm:p-8">
                        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                          <Activity size={20} className="text-[var(--color-primary)]" />
                          {t('patients.moodDistribution')}
                        </h3>
                        <ul className="space-y-3">
                          {moodDataWithEmoji.map((d) => (
                            <li key={d.code} className="flex items-center gap-3">
                              <span
                                title={d.name}
                                className="inline-block cursor-default text-xl leading-none transition-transform duration-200 ease-out hover:scale-125"
                                aria-label={d.name}
                              >
                                {d.emoji}
                              </span>
                              <span className="min-w-[100px] text-sm text-[var(--text-primary)]">{d.name}</span>
                              <div className="flex-1 min-w-0">
                                <div className="h-6 rounded-full bg-[var(--border)]/50 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[var(--color-primary)]/80 transition-all duration-300"
                                    style={{ width: `${Math.max(8, (d.count / d.maxCount) * 100)}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-medium text-[var(--text-muted)] tabular-nums">{d.count}</span>
                            </li>
                          ))}
                        </ul>
                      </GlassCard>
                    )}
                  </div>

                  {/* Last sessions & appointments */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <GlassCard className="rounded-2xl p-6 transition-shadow hover:shadow-md sm:p-8">
                      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                        <Activity size={20} />
                        {t('patients.lastSessions')}
                      </h3>
                      {allSessionsSorted.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">{t('patients.noHistoryData')}</p>
                      ) : (
                        <ul className="max-h-[320px] space-y-1.5 overflow-y-auto">
                          {allSessionsSorted.map((s) => (
                            <li
                              key={s.id}
                              role="button"
                              tabIndex={0}
                              className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)]/30 px-3 py-2.5 text-sm transition-colors hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5"
                              onClick={() => openSessionModal(s.id)}
                              onKeyDown={(e) => e.key === 'Enter' && openSessionModal(s.id)}
                            >
                              <span className="font-medium text-[var(--color-primary)]">
                                {t('sessions.sessionNumber')} {s.sessionNumber}
                              </span>
                              <span className="text-[var(--text-muted)]">{formatDateShort(s.sessionDate)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </GlassCard>
                    <GlassCard className="rounded-2xl p-6 transition-shadow hover:shadow-md sm:p-8">
                      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
                        <Calendar size={20} />
                        {t('patients.lastAppointments')}
                      </h3>
                      {lastAppointments.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">{t('patients.noHistoryData')}</p>
                      ) : (
                        <ul className="space-y-2">
                          {lastAppointments.map((a) => (
                            <li
                              key={a.id}
                              role="button"
                              tabIndex={0}
                              className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)]/30 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)]/30"
                              onClick={() => openAppointmentModal(a.id)}
                              onKeyDown={(e) => e.key === 'Enter' && openAppointmentModal(a.id)}
                            >
                              <span className="text-[var(--text-primary)]">{statusLabel(a.status)}</span>
                              <span className="text-[var(--text-muted)]">{formatDateShort(a.scheduledDate)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </GlassCard>
                  </div>
                </>
              )}

              {!isNursingRole && expedientTab === 'psychology' && !historyLoading && sessions.length === 0 && appointments.length === 0 && (
                <GlassCard className="rounded-2xl p-8 text-center">
                  <p className="text-[var(--text-muted)]">{t('patients.noHistoryData')}</p>
                </GlassCard>
              )}
              {/* Vacío Historial Médico cuando lo ve psicología y no hay datos */}
              {!isNursingRole && expedientTab === 'medical' && !historyLoading && nursingAttentions.length === 0 && nursingProcedures.length === 0 && (medicalRecord?.nursingConsultations?.length ?? 0) === 0 && (
                <GlassCard className="rounded-2xl p-8 text-center">
                  <p className="text-[var(--text-muted)]">{t('patients.noHistoryData')}</p>
                </GlassCard>
              )}
            </section>
          )}
        </>
      )}

      {/* Modal detalle del historial */}
      {historyModalType && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-detail-title"
          onClick={(e) => e.target === e.currentTarget && closeHistoryModal()}
        >
          <div
            className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="history-detail-title" className="text-lg font-semibold text-[var(--text-primary)]">
              {historyModalType === 'attention' && t('procedures.attentionDetail')}
              {historyModalType === 'procedure' && t('procedures.viewDetail')}
              {historyModalType === 'consultation' && t('patients.lastNursingConsultations')}
              {historyModalType === 'session' && t('patients.lastSessions')}
              {historyModalType === 'appointment' && t('patients.lastAppointments')}
            </h2>

            {historyModalLoading && (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">{t('common.loading')}</p>
            )}

            {!historyModalLoading && historyModalType === 'attention' && detailAttention && (
              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label={t('procedures.motive')} value={detailAttention.motive} />
                {detailAttention.disposition && <DetailRow label={t('procedures.disposition')} value={detailAttention.disposition} />}
                {detailAttention.vitalSigns && typeof detailAttention.vitalSigns === 'object' && Object.keys(detailAttention.vitalSigns).length > 0 && (
                  <DetailRow
                    label={t('procedures.vitalSigns')}
                    value={[
                      (detailAttention.vitalSigns as Record<string, number>).presionArterialSys != null && (detailAttention.vitalSigns as Record<string, number>).presionArterialDia != null
                        ? `PAS/PAD: ${(detailAttention.vitalSigns as Record<string, number>).presionArterialSys}/${(detailAttention.vitalSigns as Record<string, number>).presionArterialDia}`
                        : null,
                      (detailAttention.vitalSigns as Record<string, number>).temperatura != null ? `Temp: ${(detailAttention.vitalSigns as Record<string, number>).temperatura} °C` : null,
                      (detailAttention.vitalSigns as Record<string, number>).frecuenciaCardiaca != null ? `FC: ${(detailAttention.vitalSigns as Record<string, number>).frecuenciaCardiaca}` : null,
                      (detailAttention.vitalSigns as Record<string, number>).spo2 != null ? `SpO₂: ${(detailAttention.vitalSigns as Record<string, number>).spo2}%` : null,
                    ].filter(Boolean).join(' · ')}
                  />
                )}
                {detailAttention.lightningDiagnosis && <DetailRow label={t('procedures.lightningDiagnosis')} value={detailAttention.lightningDiagnosis} />}
                {detailAttention.treatment && <DetailRow label={t('procedures.treatmentApplied')} value={detailAttention.treatment} />}
                {detailAttention.observations && <DetailRow label={t('procedures.observations')} value={detailAttention.observations} />}
                <DetailRow label={t('common.date')} value={new Date(detailAttention.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} />
              </div>
            )}

            {!historyModalLoading && historyModalType === 'procedure' && detailProcedure && (
              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label={t('procedures.procedureType')} value={detailProcedure.procedureType} />
                <DetailRow label={t('procedures.procedureDate')} value={new Date(detailProcedure.procedureDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} />
                <DetailRow label={t('procedures.description')} value={detailProcedure.description} />
                {detailProcedure.materialsUsed && <DetailRow label={t('procedures.materialsUsed')} value={detailProcedure.materialsUsed} />}
                {detailProcedure.observations && <DetailRow label={t('procedures.observations')} value={detailProcedure.observations} />}
                {detailProcedure.performedByUser && (
                  <DetailRow label={t('procedures.performedBy')} value={`${detailProcedure.performedByUser.firstName} ${detailProcedure.performedByUser.lastName}`.trim()} />
                )}
              </div>
            )}

            {historyModalType === 'consultation' && detailConsultation && (
              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label={t('common.date')} value={new Date(detailConsultation.consultationDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} />
                <DetailRow label={t('expedient.nurse')} value={nurseName(detailConsultation)} />
                {detailConsultation.chiefComplaint && <DetailRow label={t('expedient.chiefComplaint')} value={detailConsultation.chiefComplaint} />}
                {detailConsultation.diagnosis && <DetailRow label={t('expedient.diagnosis')} value={detailConsultation.diagnosis} />}
                {detailConsultation.treatmentPlan && <DetailRow label={t('expedient.treatmentPlan')} value={detailConsultation.treatmentPlan} />}
                {detailConsultation.observations && <DetailRow label={t('procedures.observations')} value={detailConsultation.observations} />}
              </div>
            )}

            {!historyModalLoading && historyModalType === 'session' && detailSession && (
              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label={t('sessions.sessionNumber')} value={String(detailSession.sessionNumber)} />
                <DetailRow label={t('common.date')} value={new Date(detailSession.sessionDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} />
                <DetailRow label={t('sessions.duration')} value={`${detailSession.sessionDuration} min`} />
                {detailSession.status && detailSession.status !== 'scheduled' && (
                  <DetailRow
                    label={t('appointments.status', 'Estado')}
                    value={
                      detailSession.status === 'cancelled'
                        ? t('sessions.statusCancelled', 'Cancelada')
                        : detailSession.status === 'rescheduled'
                          ? t('sessions.statusRescheduled', 'Reagendada')
                          : detailSession.status
                    }
                  />
                )}
                {detailSession.mood && <DetailRow label={t('sessions.mood')} value={detailSession.mood} />}
                {detailSession.evolutionNotes && <DetailRow label={t('sessions.evolutionNotes')} value={detailSession.evolutionNotes} />}
                {detailSession.patientProgress && <DetailRow label={t('sessions.patientProgress')} value={detailSession.patientProgress} />}
                {detailSession.assignedTasks && <DetailRow label={t('sessions.assignedTasks')} value={detailSession.assignedTasks} />}
                {detailSession.status === 'cancelled' && detailSession.cancellationReason && (
                  <DetailRow
                    label={t('appointments.cancellationReason', 'Motivo de cancelación')}
                    value={detailSession.cancellationReason}
                  />
                )}
                {detailSession.status === 'rescheduled' && detailSession.rescheduleReason && (
                  <DetailRow label={t('sessions.rescheduleReason', 'Motivo de reagendar')} value={detailSession.rescheduleReason} />
                )}
                {detailSession.observations && <DetailRow label={t('procedures.observations')} value={detailSession.observations} />}
                {detailSession.nextSessionPlan && <DetailRow label={t('sessions.nextSessionPlan')} value={detailSession.nextSessionPlan} />}
                {detailSession.therapist && (
                  <DetailRow label={t('sessions.therapist')} value={`${detailSession.therapist.firstName} ${detailSession.therapist.lastName}`.trim()} />
                )}
                <div className="pt-2">
                  <Link to={`/sessions/${detailSession.id}`} className="text-sm text-[var(--color-primary)] hover:underline">
                    {t('patients.viewRecord')} →
                  </Link>
                </div>
              </div>
            )}

            {!historyModalLoading && historyModalType === 'appointment' && detailAppointment && (
              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label={t('appointments.status')} value={statusLabel(detailAppointment.status)} />
                <DetailRow label={t('appointments.date')} value={new Date(detailAppointment.scheduledDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} />
                <DetailRow label={t('appointments.duration')} value={`${detailAppointment.durationMinutes} min`} />
                <DetailRow label={t('appointments.type')} value={detailAppointment.appointmentType} />
                <DetailRow label={t('appointments.department')} value={detailAppointment.department} />
                {detailAppointment.professional && (
                  <DetailRow label={t('appointments.professional')} value={`${detailAppointment.professional.firstName} ${detailAppointment.professional.lastName}`.trim()} />
                )}
                {detailAppointment.notes && <DetailRow label={t('procedures.observations')} value={detailAppointment.notes} />}
                {detailAppointment.cancellationReason && (
                  <DetailRow label={t('appointments.cancellationReason')} value={detailAppointment.cancellationReason} />
                )}
                <div className="pt-2">
                  <Link to={`/appointments/${detailAppointment.id}`} className="text-sm text-[var(--color-primary)] hover:underline">
                    {t('patients.viewRecord')} →
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <GlassButton type="button" variant="secondary" onClick={closeHistoryModal} disabled={historyModalLoading}>
                {t('common.close')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
