import { useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  ShieldAlert,
  Search,
  Eye,
  FileSpreadsheet
} from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { getMyNursingAttentions, type NursingAttentionListItem, type NursingAttentionDetail, getNursingAttentionById } from '@/services/nursing-attention-list.service'
import { getAuditLogs } from '@/services/audit-log.service'
import { getStatisticsReport } from '@/services/report.service'
import type { AuditLog } from '@/types/audit-log'
import type { StatisticsReportData } from '@/types/report'

export function SupervisionNursing() {
  const [activeTab, setActiveTab] = useState<'attentions' | 'reports' | 'audit'>('attentions')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tab 1: Nursing Attentions
  const [attentions, setAttentions] = useState<NursingAttentionListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAttention, setSelectedAttention] = useState<NursingAttentionDetail | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Tab 2: Reports & Stats
  const [stats, setStats] = useState<StatisticsReportData | null>(null)

  // Tab 3: Audit Logs
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [logPage, setLogPage] = useState(1)
  const [logTotalPages, setLogTotalPages] = useState(1)

  // Date filters (shared/reusable)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  // Fetch Attentions (Tab 1)
  const fetchAttentions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyNursingAttentions({
        search: searchQuery,
        dateFrom: startDate,
        dateTo: endDate
      })
      setAttentions(data)
    } catch (err) {
      console.error(err)
      setError('Error al obtener los movimientos de enfermería')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Stats (Tab 2)
  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const pStart = new Date(startDate)
      const pEnd = new Date(endDate)
      const data = await getStatisticsReport({
        periodStart: pStart,
        periodEnd: pEnd,
        department: 'nursing'
      })
      setStats(data.data)
    } catch (err) {
      console.error(err)
      setError('Error al generar los reportes y estadísticas')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Audit Logs (Tab 3)
  const fetchAuditLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAuditLogs({
        page: logPage,
        limit: 15,
        startDate: startDate,
        endDate: endDate,
        role: 'enfermero' // The backend auto includes coordinator + nurse actions
      })
      setLogs(data.auditLogs)
      setLogTotalPages(data.pagination.totalPages)
    } catch (err) {
      console.error(err)
      setError('Error al obtener la bitácora de auditoría')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'attentions') {
      fetchAttentions()
    } else if (activeTab === 'reports') {
      fetchStats()
    } else if (activeTab === 'audit') {
      fetchAuditLogs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, logPage])

  const handleOpenDetail = async (id: string) => {
    setLoading(true)
    try {
      const detail = await getNursingAttentionById(id)
      setSelectedAttention(detail)
      setDetailModalOpen(true)
    } catch (err) {
      console.error(err)
      alert('No se pudo cargar el detalle de la consulta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message="Cargando información..." />

      {/* Header and Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Supervisión Médica</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Módulo de monitoreo y auditoría clínica del departamento de enfermería de la UTSC.
          </p>
        </div>
      </div>

      {/* Date and Search Bar Control (Crystal style card) */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Rango:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input text-sm rounded-lg px-2 py-1"
            />
            <span className="text-xs text-[var(--text-secondary)]">a</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input text-sm rounded-lg px-2 py-1"
            />
          </div>
          {activeTab === 'attentions' && (
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Buscar paciente o matrícula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-8 pr-3 py-1 text-sm rounded-lg"
              />
              <Search size={16} className="absolute left-2.5 top-2 text-[var(--text-secondary)]" />
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (activeTab === 'attentions') fetchAttentions()
            else if (activeTab === 'reports') fetchStats()
            else if (activeTab === 'audit') fetchAuditLogs()
          }}
          className="w-full md:w-auto px-4 py-1.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)]/80 transition-colors"
        >
          Filtrar / Recargar
        </button>
      </GlassCard>

      {/* Tabs navigation */}
      <nav className="flex gap-1 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab('attentions')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'attentions'
              ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold'
              : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
          }`}
        >
          <Activity size={18} />
          Movimientos de Enfermería
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold'
              : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
          }`}
        >
          <BarChart3 size={18} />
          Reportes y Estadísticas
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'audit'
              ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold'
              : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
          }`}
        >
          <ShieldAlert size={18} className="text-[var(--color-primary)]" />
          Bitácora de Auditoría
        </button>
      </nav>

      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] text-[var(--color-error)] text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Tab Content 1: Attentions */}
      {activeTab === 'attentions' && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Registro Histórico de Atenciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                  <th className="py-3 px-4 font-medium">Paciente</th>
                  <th className="py-3 px-4 font-medium">Matrícula</th>
                  <th className="py-3 px-4 font-medium">Motivo de Atención</th>
                  <th className="py-3 px-4 font-medium">Disposición / Destino</th>
                  <th className="py-3 px-4 font-medium">Fecha</th>
                  <th className="py-3 px-4 font-medium text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {attentions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                      No se encontraron atenciones en el rango seleccionado.
                    </td>
                  </tr>
                ) : (
                  attentions.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {item.patient.user.firstName} {item.patient.user.lastName}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {item.patient.user.enrollmentNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)] max-w-xs truncate">
                        {item.motive}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {item.disposition || 'Atendido en sitio'}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenDetail(item.id)}
                          className="p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-all"
                          title="Ver Detalle Clínico"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Tab Content 2: Reports & Stats */}
      {activeTab === 'reports' && stats && (
        <div className="space-y-6">
          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Total de Consultas</p>
                <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">
                  {stats.nursingConsultations?.totalConsultations ?? 0}
                </h3>
              </div>
              <Activity size={32} className="text-[var(--color-primary)] opacity-80" />
            </GlassCard>

            <GlassCard className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Medicamentos Administrados</p>
                <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">
                  {stats.nursingConsultations?.medicationsAdministered ?? 0}
                </h3>
              </div>
              <FileSpreadsheet size={32} className="text-green-500 opacity-80" />
            </GlassCard>

            <GlassCard className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Procedimientos Clínicos</p>
                <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mt-1">
                  {stats.nursingConsultations?.proceduresPerformed ?? 0}
                </h3>
              </div>
              <Activity size={32} className="text-orange-500 opacity-80" />
            </GlassCard>
          </div>

          {/* Administered Medications List */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Uso de Medicamentos en Consulta</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                    <th className="py-3 px-4 font-medium">Paciente</th>
                    <th className="py-3 px-4 font-medium">Matrícula</th>
                    <th className="py-3 px-4 font-medium">Medicamento</th>
                    <th className="py-3 px-4 font-medium">Dosis / Vía</th>
                    <th className="py-3 px-4 font-medium">Fecha</th>
                    <th className="py-3 px-4 font-medium text-center">Verificaciones de Seguridad</th>
                  </tr>
                </thead>
                <tbody>
                  {!stats.nursingConsultations?.medicationAdministrations?.length ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                        No se registraron administraciones de medicamentos en este periodo.
                      </td>
                    </tr>
                  ) : (
                    stats.nursingConsultations.medicationAdministrations.map((adm) => (
                      <tr key={adm.id} className="border-b border-[var(--border)]">
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{adm.patient}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{adm.enrollmentNumber || 'N/A'}</td>
                        <td className="py-3 px-4 text-[var(--text-primary)]">{adm.medication}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{adm.dosage} ({adm.route})</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {new Date(adm.administrationDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-1">
                            <span className={`px-2 py-0.5 text-xs rounded font-semibold ${adm.patientVerified ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`} title="Paciente verificado">Pac.</span>
                            <span className={`px-2 py-0.5 text-xs rounded font-semibold ${adm.medicationVerified ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`} title="Medicamento verificado">Med.</span>
                            <span className={`px-2 py-0.5 text-xs rounded font-semibold ${adm.dosageVerified ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`} title="Dosis verificada">Dos.</span>
                            <span className={`px-2 py-0.5 text-xs rounded font-semibold ${adm.routeVerified ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`} title="Vía verificada">Vía</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab Content 3: Audit Logs */}
      {activeTab === 'audit' && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Bitácora de Auditoría y Seguridad</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                  <th className="py-3 px-4 font-medium">Fecha y Hora</th>
                  <th className="py-3 px-4 font-medium">Actor</th>
                  <th className="py-3 px-4 font-medium">Rol</th>
                  <th className="py-3 px-4 font-medium">Acción</th>
                  <th className="py-3 px-4 font-medium">Detalles / Evento</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--text-secondary)]">
                      No hay eventos registrados en este periodo para enfermería.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-[var(--border)]">
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)] font-medium">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema'}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {log.user?.role === 'enfermero' ? 'Enfermera/o' : 'Coordinador/a'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--color-primary)]">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)] max-w-sm truncate" title={log.eventDetail || ''}>
                        {log.eventDetail || `Modificación en tabla: ${log.tableName}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination */}
          {logTotalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={logPage === 1}
                onClick={() => setLogPage((prev) => prev - 1)}
                className="px-3 py-1.5 text-sm bg-black/5 dark:bg-white/5 rounded-lg disabled:opacity-50 hover:bg-black/10 dark:hover:bg-white/10"
              >
                Anterior
              </button>
              <span className="text-xs text-[var(--text-secondary)]">Pág. {logPage} de {logTotalPages}</span>
              <button
                disabled={logPage === logTotalPages}
                onClick={() => setLogPage((prev) => prev + 1)}
                className="px-3 py-1.5 text-sm bg-black/5 dark:bg-white/5 rounded-lg disabled:opacity-50 hover:bg-black/10 dark:hover:bg-white/10"
              >
                Siguiente
              </button>
            </div>
          )}
        </GlassCard>
      )}

      {/* Clinical Detail Modal */}
      {detailModalOpen && selectedAttention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-2xl p-6 bg-[var(--background-card)] overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Detalle de Consulta de Enfermería</h3>
                <p className="text-xs text-[var(--text-secondary)]">ID: {selectedAttention.id}</p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl font-bold px-2"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="font-semibold text-[var(--text-secondary)]">Paciente:</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {selectedAttention.patient?.user.firstName} {selectedAttention.patient?.user.lastName}
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text-secondary)]">Matrícula:</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {selectedAttention.patient?.user.enrollmentNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text-secondary)]">Fecha de Registro:</p>
                <p className="text-[var(--text-primary)]">
                  {new Date(selectedAttention.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text-secondary)]">Disposición / Destino:</p>
                <p className="text-[var(--text-primary)] font-medium">
                  {selectedAttention.disposition || 'Retorna a actividades'}
                </p>
              </div>
            </div>

            <hr className="border-[var(--border)] my-4" />

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-[var(--text-secondary)] mb-1">Motivo de Atención:</p>
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg text-[var(--text-primary)]">
                  {selectedAttention.motive}
                </div>
              </div>

              {selectedAttention.vitalSigns && (
                <div>
                  <p className="font-semibold text-[var(--text-secondary)] mb-1">Signos Vitales:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg text-center text-xs">
                    <div>
                      <p className="text-[var(--text-secondary)]">T/A Sys</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{selectedAttention.vitalSigns.presionArterialSys || '--'} mmHg</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)]">T/A Dia</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{selectedAttention.vitalSigns.presionArterialDia || '--'} mmHg</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)]">Temp</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{selectedAttention.vitalSigns.temperatura || '--'} °C</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)]">F/C</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{selectedAttention.vitalSigns.frecuenciaCardiaca || '--'} lpm</p>
                    </div>
                    <div>
                      <p className="text-[var(--text-secondary)]">SpO2</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{selectedAttention.vitalSigns.spo2 || '--'} %</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="font-semibold text-[var(--text-secondary)] mb-1">Diagnóstico Relámpago:</p>
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg text-[var(--text-primary)]">
                  {selectedAttention.lightningDiagnosis || 'No especificado'}
                </div>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-secondary)] mb-1">Tratamiento Aplicado:</p>
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg text-[var(--text-primary)]">
                  {selectedAttention.treatment || 'No especificado'}
                </div>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-secondary)] mb-1">Observaciones Clínicas:</p>
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg text-[var(--text-primary)]">
                  {selectedAttention.observations || 'Sin observaciones'}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[var(--border)] pt-4 mt-6">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 text-[var(--text-primary)] text-sm font-semibold rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
