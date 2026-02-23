import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, MessageSquare, FileText, Calendar } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import {
  getStatisticsReport,
  getConsultationsReport,
  getDiagnosesReport,
} from '@/services/report.service'
import type {
  StatisticsReportData,
  ConsultationsReportData,
  DiagnosesReportData,
} from '@/types/report'

const today = new Date()
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

function toDateInput(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

export function ReportsPage() {
  const { t } = useTranslation()
  const [periodStart, setPeriodStart] = useState(toDateInput(startOfMonth))
  const [periodEnd, setPeriodEnd] = useState(toDateInput(endOfMonth))
  const [department, setDepartment] = useState('')

  const [statisticsData, setStatisticsData] = useState<StatisticsReportData | null>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(false)
  const [statisticsError, setStatisticsError] = useState<string | null>(null)

  const [consultationsData, setConsultationsData] = useState<ConsultationsReportData | null>(null)
  const [consultationsLoading, setConsultationsLoading] = useState(false)
  const [consultationsError, setConsultationsError] = useState<string | null>(null)

  const [diagnosesData, setDiagnosesData] = useState<DiagnosesReportData | null>(null)
  const [diagnosesLoading, setDiagnosesLoading] = useState(false)
  const [diagnosesError, setDiagnosesError] = useState<string | null>(null)

  const params = () => ({
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    department: department || undefined,
  })

  const handleStatistics = async () => {
    setStatisticsError(null)
    setStatisticsLoading(true)
    try {
      const res = await getStatisticsReport(params())
      setStatisticsData(res.data)
    } catch {
      setStatisticsError(t('reports.error'))
      setStatisticsData(null)
    } finally {
      setStatisticsLoading(false)
    }
  }

  const handleConsultations = async () => {
    setConsultationsError(null)
    setConsultationsLoading(true)
    try {
      const res = await getConsultationsReport(params())
      setConsultationsData(res.data)
    } catch {
      setConsultationsError(t('reports.error'))
      setConsultationsData(null)
    } finally {
      setConsultationsLoading(false)
    }
  }

  const handleDiagnoses = async () => {
    setDiagnosesError(null)
    setDiagnosesLoading(true)
    try {
      const res = await getDiagnosesReport(params())
      setDiagnosesData(res.data)
    } catch {
      setDiagnosesError(t('reports.error'))
      setDiagnosesData(null)
    } finally {
      setDiagnosesLoading(false)
    }
  }

  const departmentLabel = (d: string) => {
    if (!d || d === 'all') return t('reports.departmentAll')
    if (d === 'psychology') return t('reports.departmentPsychology')
    if (d === 'nursing') return t('reports.departmentNursing')
    return d
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('reports.title')}</h1>

      <GlassCard>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <Calendar size={18} />
          Período y departamento
        </h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t('reports.periodStart')}</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="glass-input px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t('reports.periodEnd')}</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="glass-input px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">{t('reports.department')}</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="glass-input px-4 py-2.5 min-w-[140px]"
            >
              <option value="">{t('reports.departmentAll')}</option>
              <option value="psychology">{t('reports.departmentPsychology')}</option>
              <option value="nursing">{t('reports.departmentNursing')}</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Statistics */}
      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <BarChart3 size={22} />
            {t('reports.statistics')}
          </h2>
          <GlassButton onClick={handleStatistics} disabled={statisticsLoading}>
            {statisticsLoading ? t('common.loading') : t('reports.generate')}
          </GlassButton>
        </div>
        {statisticsError && <p className="mt-2 text-sm text-[var(--color-error)]">{statisticsError}</p>}
        {statisticsData && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              {formatDate(statisticsData.period.start)} – {formatDate(statisticsData.period.end)} · {departmentLabel(statisticsData.department)}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[var(--border)] bg-black/5 p-4 dark:bg-white/5">
                <p className="text-xs text-[var(--text-muted)]">{t('reports.totalAppointments')}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{statisticsData.appointments.total}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {t('reports.completedAppointments')}: {statisticsData.appointments.completed} · {t('reports.cancelledAppointments')}: {statisticsData.appointments.cancelled}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-black/5 p-4 dark:bg-white/5">
                <p className="text-xs text-[var(--text-muted)]">{t('reports.totalPatients')}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{statisticsData.patients.total}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{t('reports.newPatients')}: {statisticsData.patients.newPatients}</p>
              </div>
              {statisticsData.therapySessions !== undefined && (
                <div className="rounded-xl border border-[var(--border)] bg-black/5 p-4 dark:bg-white/5">
                  <p className="text-xs text-[var(--text-muted)]">{t('reports.therapySessions')}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{statisticsData.therapySessions}</p>
                </div>
              )}
              {statisticsData.nursingConsultations && (
                <div className="rounded-xl border border-[var(--border)] bg-black/5 p-4 dark:bg-white/5">
                  <p className="text-xs text-[var(--text-muted)]">{t('reports.nursingStats')}</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{statisticsData.nursingConsultations.totalConsultations} {t('reports.totalConsultations')}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {t('reports.medicationsAdministered')}: {statisticsData.nursingConsultations.medicationsAdministered} · {t('reports.proceduresPerformed')}: {statisticsData.nursingConsultations.proceduresPerformed}
                  </p>
                </div>
              )}
            </div>
            {statisticsData.appointments.byType.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('reports.byType')}</p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {statisticsData.appointments.byType.map((item) => (
                    <li key={item.type} className="rounded-lg bg-black/5 px-2 py-1 text-sm dark:bg-white/5">
                      {item.type}: {item.count}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Consultations */}
      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <MessageSquare size={22} />
            {t('reports.consultations')}
          </h2>
          <GlassButton onClick={handleConsultations} disabled={consultationsLoading}>
            {consultationsLoading ? t('common.loading') : t('reports.generate')}
          </GlassButton>
        </div>
        {consultationsError && <p className="mt-2 text-sm text-[var(--color-error)]">{consultationsError}</p>}
        {consultationsData && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              {formatDate(consultationsData.period.start)} – {formatDate(consultationsData.period.end)} · {departmentLabel(consultationsData.department)}
            </p>
            <p className="text-lg font-medium text-[var(--text-primary)]">{t('reports.summary')}: {consultationsData.summary.total} {t('reports.totalConsultations')}</p>
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Paciente</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.from')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.to')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Urgencia</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Estado</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {consultationsData.consultations.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-[var(--text-muted)]">{t('reports.noData')}</td></tr>
                  ) : (
                    consultationsData.consultations.map((c) => (
                      <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.patient}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.fromDepartment}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.toDepartment}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.urgency}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.status}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(c.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Diagnoses */}
      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <FileText size={22} />
            {t('reports.diagnoses')}
          </h2>
          <GlassButton onClick={handleDiagnoses} disabled={diagnosesLoading}>
            {diagnosesLoading ? t('common.loading') : t('reports.generate')}
          </GlassButton>
        </div>
        {diagnosesError && <p className="mt-2 text-sm text-[var(--color-error)]">{diagnosesError}</p>}
        {diagnosesData && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              {formatDate(diagnosesData.period.start)} – {formatDate(diagnosesData.period.end)} · Psicología
            </p>
            <p className="text-lg font-medium text-[var(--text-primary)]">
              {t('reports.summary')}: {diagnosesData.summary.totalRecords} {t('reports.totalRecords')} · {t('reports.dsm5')}: {diagnosesData.summary.totalDiagnosesDsm5} · {t('reports.cie10')}: {diagnosesData.summary.totalDiagnosesCie10}
            </p>
            {diagnosesData.summary.mostCommonDsm5.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('reports.mostCommon')} DSM-5</p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {diagnosesData.summary.mostCommonDsm5.map((item, i) => (
                    <li key={i} className="rounded-lg bg-black/5 px-2 py-1 text-sm dark:bg-white/5">{item.diagnosis}: {item.count}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Paciente</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">DSM-5</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">CIE-10</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.sessionCount')}</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosesData.records.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--text-muted)]">{t('reports.noData')}</td></tr>
                  ) : (
                    diagnosesData.records.map((r, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{r.patient}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{r.diagnosisDsm5 ?? '—'}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{r.diagnosisCie10 ?? '—'}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{r.sessionCount}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
