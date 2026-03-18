import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, MessageSquare, Calendar, FileSpreadsheet, FileType } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import {
  getStatisticsReport,
  getConsultationsReport,
} from '@/services/report.service'
import {
  exportStatisticsToExcel,
  exportStatisticsToPdf,
  exportConsultationsToExcel,
  exportConsultationsToPdf,
  exportStatisticsToCsv,
  exportConsultationsToCsv,
} from '@/utils/reportExport'
import { getTableRowClass } from '@/utils/tableRowColors'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { ROLES } from '@/constants/roles'
import { PasswordInput } from '@/components/atoms/PasswordInput'
import type {
  StatisticsReportData,
  ConsultationsReportData,
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
  const currentUser = useAuthStore((s) => s.user)
  const isCoordinatorPsychology = currentUser?.role === ROLES.COORDINADOR_PSICOLOGIA
  const [periodStart, setPeriodStart] = useState(toDateInput(startOfMonth))
  const [periodEnd, setPeriodEnd] = useState(toDateInput(endOfMonth))
  const [department, setDepartment] = useState(isCoordinatorPsychology ? 'psychology' : '')

  const [statisticsData, setStatisticsData] = useState<StatisticsReportData | null>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(false)
  const [statisticsError, setStatisticsError] = useState<string | null>(null)

  const [consultationsData, setConsultationsData] = useState<ConsultationsReportData | null>(null)
  const [consultationsLoading, setConsultationsLoading] = useState(false)
  const [consultationsError, setConsultationsError] = useState<string | null>(null)

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel')
  const [exportType, setExportType] = useState<'statistics' | 'consultations'>('statistics')
  const [exportPassword, setExportPassword] = useState('')
  const [exportPasswordError, setExportPasswordError] = useState<string | null>(null)
  const [exportVerifying, setExportVerifying] = useState(false)

  const params = () => ({
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    department: isCoordinatorPsychology ? 'psychology' : (department || undefined),
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

  const departmentLabel = (d: string) => {
    if (!d || d === 'all') return t('reports.departmentAll')
    if (d === 'psychology') return t('reports.departmentPsychology')
    if (d === 'nursing') return t('reports.departmentNursing')
    return d
  }

  const openExportModal = (format: 'excel' | 'pdf' | 'csv', type: 'statistics' | 'consultations') => {
    setExportFormat(format)
    setExportType(type)
    setExportPassword('')
    setExportPasswordError(null)
    setExportModalOpen(true)
  }

  const handleConfirmExport = async () => {
    if (!currentUser?.email) {
      setExportPasswordError(t('auth.invalidCredentials'))
      return
    }
    if (!exportPassword) {
      setExportPasswordError(t('auth.passwordMinLength'))
      return
    }
    setExportVerifying(true)
    setExportPasswordError(null)
    try {
      // Reautenticar antes de permitir la descarga
      await api.post('/auth/login', {
        email: currentUser.email,
        password: exportPassword,
      })

    const baseName = `reporte_${periodStart}_${periodEnd}`
    if (exportType === 'statistics' && statisticsData) {
      if (exportFormat === 'excel') exportStatisticsToExcel(statisticsData, baseName)
      else if (exportFormat === 'pdf') exportStatisticsToPdf(statisticsData, baseName)
      else exportStatisticsToCsv(statisticsData, baseName)
    } else if (exportType === 'consultations' && consultationsData) {
      if (exportFormat === 'excel') exportConsultationsToExcel(consultationsData, baseName)
      else if (exportFormat === 'pdf') exportConsultationsToPdf(consultationsData, baseName)
      else exportConsultationsToCsv(consultationsData, baseName)
    }
    setExportModalOpen(false)
    setExportPassword('')
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setExportPasswordError(msg || t('auth.invalidCredentials'))
    } finally {
      setExportVerifying(false)
    }
  }

  const exportFormatLabel =
    exportFormat === 'excel'
      ? t('reports.formatExcel')
      : exportFormat === 'pdf'
        ? t('reports.formatPdf')
        : 'CSV'

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onConfirm={handleConfirmExport}
        title={t('reports.confirmExportTitle')}
        message={t('reports.confirmExportMessage', { format: exportFormatLabel })}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        confirming={exportVerifying}
        detail={
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              {t('auth.password')}
            </label>
            <PasswordInput
              value={exportPassword}
              onChange={(e) => {
                setExportPassword(e.target.value)
                setExportPasswordError(null)
              }}
              placeholder="********"
            />
            {exportPasswordError && (
              <p className="text-xs text-[var(--color-error)]">{exportPasswordError}</p>
            )}
          </div>
        }
      />
      {isCoordinatorPsychology && (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--color-primary)]/10 px-4 py-3 text-sm text-[var(--text-primary)]">
          {t('reports.coordinatorPsychologyNote')}
        </p>
      )}
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
          {!isCoordinatorPsychology && (
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
          )}
          {isCoordinatorPsychology && (
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">{t('reports.department')}</label>
              <div className="glass-input px-4 py-2.5 min-w-[140px] text-[var(--text-primary)]">
                {t('reports.departmentPsychology')}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Statistics */}
      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <BarChart3 size={22} />
            {t('reports.statistics')}
          </h2>
          <div className="flex items-center gap-2">
            {!statisticsData ? (
              <GlassButton onClick={handleStatistics} disabled={statisticsLoading}>
                {statisticsLoading ? t('common.loading') : t('reports.generate')}
              </GlassButton>
            ) : (
              <>
                <GlassButton
                  type="button"
                  variant="glass"
                  title={t('reports.exportExcel')}
                  onClick={() => openExportModal('excel', 'statistics')}
                  className="p-2 bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <FileSpreadsheet size={20} aria-hidden />
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="glass"
                  title="CSV"
                  onClick={() => openExportModal('csv', 'statistics')}
                  className="p-2 bg-black text-white hover:bg-neutral-800"
                >
                  CSV
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="glass"
                  title={t('reports.exportPdf')}
                  onClick={() => openExportModal('pdf', 'statistics')}
                  className="p-2 bg-rose-500 text-white hover:bg-rose-600"
                >
                  <FileType size={20} aria-hidden />
                </GlassButton>
              </>
            )}
          </div>
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

            {/* Medicamentos (detalle) */}
            {statisticsData.nursingConsultations?.medicationsByMedication?.length ? (
              <div className="mt-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t('reports.medicationsAdministeredDetail', 'Medicamentos administrados (detalle)')}
                </p>
                <div className="mt-2 overflow-x-auto rounded-xl border border-[var(--glass-border)]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.medication', 'Medicamento')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.count', 'Cantidad')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statisticsData.nursingConsultations.medicationsByMedication!.map((m) => (
                        <tr key={m.medication} className="border-b border-[var(--border)] last:border-b-0">
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{m.medication}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{m.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Pacientes (detalle) */}
            {statisticsData.patientsList?.length ? (
              <div className="mt-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t('reports.patientsDetail', 'Pacientes atendidos (detalle)')}
                </p>
                <div className="mt-2 overflow-x-auto rounded-xl border border-[var(--glass-border)]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.patient', 'Paciente')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.enrollment', 'Matrícula')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.consultationsCount', 'Consultas')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.firstSeen', 'Primera')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.lastSeen', 'Última')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statisticsData.patientsList.map((p) => (
                        <tr key={`${p.patient}-${p.lastConsultationAt}`} className="border-b border-[var(--border)] last:border-b-0">
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{p.patient}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{p.enrollmentNumber ?? '—'}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{p.consultationsCount}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(p.firstConsultationAt)}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(p.lastConsultationAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Citas (detalle) */}
            {statisticsData.appointmentsList?.length ? (
              <div className="mt-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('reports.appointmentsDetail', 'Citas (detalle)')}</p>
                <div className="mt-2 overflow-x-auto rounded-xl border border-[var(--glass-border)]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.patient', 'Paciente')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.type', 'Tipo')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.professional', 'Profesional')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.status', 'Estado')}</th>
                        <th className="px-4 py-3 font-medium text-[var(--text-primary)]">{t('reports.date', 'Fecha')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statisticsData.appointmentsList.map((a) => (
                        <tr key={a.id} className="border-b border-[var(--border)] last:border-b-0">
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{a.patient}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{a.appointmentType}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{a.professional}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{a.status}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(a.scheduledDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

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
          <div className="flex items-center gap-2">
            {!consultationsData ? (
              <GlassButton onClick={handleConsultations} disabled={consultationsLoading}>
                {consultationsLoading ? t('common.loading') : t('reports.generate')}
              </GlassButton>
            ) : (
              <>
                <GlassButton
                  type="button"
                  variant="glass"
                  title={t('reports.exportExcel')}
                  onClick={() => openExportModal('excel', 'consultations')}
                  className="p-2 bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <FileSpreadsheet size={20} aria-hidden />
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="glass"
                  title="CSV"
                  onClick={() => openExportModal('csv', 'consultations')}
                  className="p-2 bg-black text-white hover:bg-neutral-800"
                >
                  CSV
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="glass"
                  title={t('reports.exportPdf')}
                  onClick={() => openExportModal('pdf', 'consultations')}
                  className="p-2 bg-rose-500 text-white hover:bg-rose-600"
                >
                  <FileType size={20} aria-hidden />
                </GlassButton>
              </>
            )}
          </div>
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
                    consultationsData.consultations.map((c) => {
                      const rowVariant = c.status === 'Respondida' ? 'success' : (c.status === 'Cancelada' ? 'error' : 'warning')
                      return (
                      <tr key={c.id} className={getTableRowClass(rowVariant)}>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.patient}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.fromDepartment}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.toDepartment}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.urgency}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{c.status}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(c.createdAt)}</td>
                      </tr>
                    )})
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
