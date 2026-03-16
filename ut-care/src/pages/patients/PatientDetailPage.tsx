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
import { canAccessExpedient } from '@/constants/roles'
import { useAuthStore } from '@/store/auth.store'
import type { Patient } from '@/types/patient'
import type { TherapySession } from '@/types/therapy-session'
import type { Appointment } from '@/types/appointment'
import type { MedicalRecord, NursingConsultation } from '@/types/medical-record'
import type { Mood } from '@/types/mood'
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

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moods, setMoods] = useState<Mood[]>([])

  const isCoordinatorPsychology = user?.role === ROLES.COORDINADOR_PSICOLOGIA
  const isCoordinatorNursing = user?.role === ROLES.COORDINADOR_ENFERMERIA
  const showExpedient = canAccessExpedient(user?.role)
  const showHistory = isCoordinatorPsychology || isCoordinatorNursing || showExpedient

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
    if (isCoordinatorNursing) {
      getMedicalRecordByPatientId(id)
        .then(setMedicalRecord)
        .catch(() => setMedicalRecord(null))
        .finally(() => setHistoryLoading(false))
      return
    }
    Promise.all([
      getTherapySessions({ patientId: id, limit: 200 }),
      getAppointments({ patientId: id, limit: 200 }),
    ])
      .then(([sessRes, apptRes]) => {
        setSessions(sessRes.sessions)
        setAppointments(apptRes.appointments)
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [id, showHistory, isCoordinatorNursing])

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

          {/* Historial: coordinador enfermería solo ve datos de enfermería; psicología/otros ven sesiones y citas */}
          {showHistory && (
            <section className="space-y-8">
              {isCoordinatorNursing ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                      <Activity size={24} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('patients.nursingHistoryTitle')}</h2>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{t('expedient.nursingConsultations')}</p>
                    </div>
                  </div>
                  {historyLoading && (
                    <div className="flex h-32 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)]/50">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                    </div>
                  )}
                  {!historyLoading && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <GlassCard className="rounded-2xl border-l-4 border-l-[var(--color-primary)] transition-shadow hover:shadow-md">
                          <p className="text-sm font-medium text-[var(--text-muted)]">{t('patients.nursingVisits')}</p>
                          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{medicalRecord?.nursingConsultations?.length ?? 0}</p>
                        </GlassCard>
                        <GlassCard className="rounded-2xl border-l-4 border-l-[#06b6d4] transition-shadow hover:shadow-md">
                          <p className="text-sm font-medium text-[var(--text-muted)]">{t('patients.recurrencesLast6Months')}</p>
                          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{medicalRecord ? nursingRecurrencesLast6Months(medicalRecord.nursingConsultations) : 0}</p>
                        </GlassCard>
                        <GlassCard className="rounded-2xl border-l-4 border-l-[#eab308] transition-shadow hover:shadow-md">
                          <p className="text-sm font-medium text-[var(--text-muted)]">{t('patients.alerts')}</p>
                          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{nursingAlertCount(medicalRecord)}</p>
                        </GlassCard>
                      </div>
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
                                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)]/30 px-3 py-2 text-sm"
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
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                      <Activity size={24} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('patients.historyTitle')}</h2>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        {t('patients.sessionsOverTime')}
                      </p>
                    </div>
                  </div>

                  {historyLoading && (
                    <div className="flex h-32 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)]/50">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                    </div>
                  )}

                  {!historyLoading && (sessions.length > 0 || appointments.length > 0) && (
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
                            <li key={s.id}>
                              <Link
                                to={`/sessions/${s.id}`}
                                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)]/30 px-3 py-2.5 text-sm transition-colors hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5"
                              >
                                <span className="font-medium text-[var(--color-primary)]">
                                  {t('sessions.sessionNumber')} {s.sessionNumber}
                                </span>
                                <span className="text-[var(--text-muted)]">{formatDateShort(s.sessionDate)}</span>
                              </Link>
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
                              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)]/30 px-3 py-2 text-sm"
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

              {!historyLoading && sessions.length === 0 && appointments.length === 0 && (
                    <GlassCard className="rounded-2xl p-8 text-center">
                      <p className="text-[var(--text-muted)]">{t('patients.noHistoryData')}</p>
                    </GlassCard>
                  )}
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
