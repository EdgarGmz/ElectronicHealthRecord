import jsPDF from 'jspdf'
import { applyPlugin, autoTable } from 'jspdf-autotable'
import { exportRowsToXlsx } from '@/utils/xlsxExport'

applyPlugin(jsPDF)
import type {
  StatisticsReportData,
  ConsultationsReportData,
  DiagnosesReportData,
} from '@/types/report'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' })
}

/** Export statistics report to Excel */
export function exportStatisticsToExcel(
  data: StatisticsReportData,
  filenameBase: string
): void {
  const rows: (string | number)[][] = [
    ['Período', `${formatDate(data.period.start)} - ${formatDate(data.period.end)}`],
    ['Departamento', data.department || 'Todos'],
    [],
    ['Citas', ''],
    ['Total citas', data.appointments.total],
    ['Completadas', data.appointments.completed],
    ['Canceladas', data.appointments.cancelled],
    [],
    ['Pacientes', ''],
    ['Total pacientes', data.patients.total],
    ['Nuevos en período', data.patients.newPatients],
  ]
  if (data.therapySessions !== undefined) {
    rows.push([], ['Sesiones de terapia', data.therapySessions])
  }
  if (data.nursingConsultations) {
    rows.push(
      [],
      ['Enfermería', ''],
      ['Total consultas', data.nursingConsultations.totalConsultations],
      ['Medicamentos administrados', data.nursingConsultations.medicationsAdministered],
      ['Procedimientos realizados', data.nursingConsultations.proceduresPerformed]
    )
  }
  if (data.appointments.byType.length > 0) {
    rows.push([], ['Citas por tipo', ''])
    data.appointments.byType.forEach((item) => {
      rows.push([item.type, item.count])
    })
  }
  exportRowsToXlsx(rows, `${filenameBase}_estadisticas.xlsx`, 'Estadísticas')
}

/** Export statistics report to CSV */
export function exportStatisticsToCsv(
  data: StatisticsReportData,
  filenameBase: string
): void {
  const rows: (string | number)[][] = [
    ['Periodo', `${formatDate(data.period.start)} - ${formatDate(data.period.end)}`],
    ['Departamento', data.department || 'Todos'],
    [],
    ['Citas', ''],
    ['Total citas', data.appointments.total],
    ['Completadas', data.appointments.completed],
    ['Canceladas', data.appointments.cancelled],
    [],
    ['Pacientes', ''],
    ['Total pacientes', data.patients.total],
    ['Nuevos en período', data.patients.newPatients],
  ]
  if (data.therapySessions !== undefined) {
    rows.push([], ['Sesiones de terapia', data.therapySessions])
  }
  if (data.nursingConsultations) {
    rows.push(
      [],
      ['Enfermería', ''],
      ['Total consultas', data.nursingConsultations.totalConsultations],
      ['Medicamentos administrados', data.nursingConsultations.medicationsAdministered],
      ['Procedimientos realizados', data.nursingConsultations.proceduresPerformed],
    )
  }
  if (data.appointments.byType.length > 0) {
    rows.push([], ['Citas por tipo', ''])
    data.appointments.byType.forEach((item) => {
      rows.push([item.type, item.count])
    })
  }
  downloadCsv(`${filenameBase}_estadisticas`, rows)
}

/** Export statistics report to PDF */
export function exportStatisticsToPdf(
  data: StatisticsReportData,
  filenameBase: string
): void {
  const doc = new jsPDF()
  let y = 15
  doc.setFontSize(14)
  doc.text('Reporte de estadísticas', 14, y)
  y += 8
  doc.setFontSize(10)
  doc.text(`Período: ${formatDate(data.period.start)} - ${formatDate(data.period.end)}`, 14, y)
  y += 6
  doc.text(`Departamento: ${data.department || 'Todos'}`, 14, y)
  y += 10
  doc.text(`Citas: total ${data.appointments.total} (completadas: ${data.appointments.completed}, canceladas: ${data.appointments.cancelled})`, 14, y)
  y += 6
  doc.text(`Pacientes: total ${data.patients.total}, nuevos en período: ${data.patients.newPatients}`, 14, y)
  if (data.therapySessions !== undefined) {
    y += 6
    doc.text(`Sesiones de terapia: ${data.therapySessions}`, 14, y)
  }
  if (data.nursingConsultations) {
    y += 6
    doc.text(`Enfermería: ${data.nursingConsultations.totalConsultations} consultas, ${data.nursingConsultations.medicationsAdministered} medicamentos, ${data.nursingConsultations.proceduresPerformed} procedimientos`, 14, y)
  }
  if (data.appointments.byType.length > 0) {
    y += 10
    autoTable(doc, {
      startY: y,
      head: [['Tipo', 'Cantidad']],
      body: data.appointments.byType.map((item) => [item.type, String(item.count)]),
    })
  }
  doc.save(`${filenameBase}_estadisticas.pdf`)
}

/** Export consultations report to Excel */
export function exportConsultationsToExcel(
  data: ConsultationsReportData,
  filenameBase: string
): void {
  const headers = ['Paciente', 'De', 'A', 'Urgencia', 'Estado', 'Fecha']
  const body = data.consultations.map((c) => [
    c.patient,
    c.fromDepartment,
    c.toDepartment,
    c.urgency,
    c.status,
    formatDate(c.createdAt),
  ])
  exportRowsToXlsx([headers, ...body], `${filenameBase}_interconsultas.xlsx`, 'Interconsultas')
}

/** Export consultations report to CSV */
export function exportConsultationsToCsv(
  data: ConsultationsReportData,
  filenameBase: string
): void {
  const headers = ['Paciente', 'De', 'A', 'Urgencia', 'Estado', 'Fecha']
  const body = data.consultations.map((c) => [
    c.patient,
    c.fromDepartment,
    c.toDepartment,
    c.urgency,
    c.status,
    formatDate(c.createdAt),
  ])
  downloadCsv(`${filenameBase}_interconsultas`, [headers, ...body])
}

/** Export consultations report to PDF */
export function exportConsultationsToPdf(
  data: ConsultationsReportData,
  filenameBase: string
): void {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text('Reporte de interconsultas', 14, 15)
  doc.setFontSize(10)
  doc.text(`Período: ${formatDate(data.period.start)} - ${formatDate(data.period.end)} · Total: ${data.summary.total}`, 14, 22)
  autoTable(doc, {
    startY: 28,
    head: [['Paciente', 'De', 'A', 'Urgencia', 'Estado', 'Fecha']],
    body: data.consultations.map((c) => [
      c.patient,
      c.fromDepartment,
      c.toDepartment,
      c.urgency,
      c.status,
      formatDate(c.createdAt),
    ]),
  })
  doc.save(`${filenameBase}_interconsultas.pdf`)
}

/** Export diagnoses report to Excel */
export function exportDiagnosesToExcel(
  data: DiagnosesReportData,
  filenameBase: string
): void {
  const headers = ['Paciente', 'DSM-5', 'CIE-10', 'Sesiones', 'Fecha']
  const body = data.records.map((r) => [
    r.patient,
    r.diagnosisDsm5 ?? '—',
    r.diagnosisCie10 ?? '—',
    r.sessionCount,
    formatDate(r.createdAt),
  ])
  exportRowsToXlsx([headers, ...body], `${filenameBase}_diagnosticos.xlsx`, 'Diagnósticos')
}

/** Export diagnoses report to CSV */
export function exportDiagnosesToCsv(
  data: DiagnosesReportData,
  filenameBase: string
): void {
  const headers = ['Paciente', 'DSM-5', 'CIE-10', 'Sesiones', 'Fecha']
  const body = data.records.map((r) => [
    r.patient,
    r.diagnosisDsm5 ?? '—',
    r.diagnosisCie10 ?? '—',
    r.sessionCount,
    formatDate(r.createdAt),
  ])
  downloadCsv(`${filenameBase}_diagnosticos`, [headers, ...body])
}

function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const v = String(value ?? '')
          const escaped = v.replace(/"/g, '""')
          return `"${escaped}"`
        })
        .join(','),
    )
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Export diagnoses report to PDF */
export function exportDiagnosesToPdf(
  data: DiagnosesReportData,
  filenameBase: string
): void {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text('Reporte de diagnósticos', 14, 15)
  doc.setFontSize(10)
  doc.text(`Período: ${formatDate(data.period.start)} - ${formatDate(data.period.end)} · Registros: ${data.summary.totalRecords}`, 14, 22)
  autoTable(doc, {
    startY: 28,
    head: [['Paciente', 'DSM-5', 'CIE-10', 'Sesiones', 'Fecha']],
    body: data.records.map((r) => [
      r.patient,
      r.diagnosisDsm5 ?? '—',
      r.diagnosisCie10 ?? '—',
      String(r.sessionCount),
      formatDate(r.createdAt),
    ]),
  })
  doc.save(`${filenameBase}_diagnosticos.pdf`)
}
