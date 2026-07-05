import jsPDF from 'jspdf'
import { applyPlugin, autoTable } from 'jspdf-autotable'
import { exportRowsToXlsx } from '@/utils/xlsxExport'

applyPlugin(jsPDF)

export interface ExportMetadata {
  user: string
  role: string
  dateTime: string
  disclaimer: string
}

/**
 * Exporta una tabla genérica a CSV, incluyendo metadatos de auditoría al inicio.
 */
export function exportTableToCsv(
  headers: string[],
  rows: string[][],
  filename: string,
  metadata?: ExportMetadata
): void {
  const escape = (cell: string) => {
    const s = String(cell ?? '')
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const line = (row: string[]) => row.map(escape).join(',')

  const lines: string[] = []
  if (metadata) {
    lines.push(line(['REPORTE CONFIDENCIAL - ELECTRONIC HEALTH RECORD']))
    lines.push(line(['Generado por:', metadata.user]))
    lines.push(line(['Rol:', metadata.role]))
    lines.push(line(['Fecha y hora:', metadata.dateTime]))
    lines.push(line(['Aviso de seguridad:', metadata.disclaimer]))
    lines.push('') // Línea vacía separatoria
  }

  lines.push(line(headers))
  rows.forEach((row) => lines.push(line(row)))

  const csv = lines.join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Exporta una tabla genérica a Excel (XLSX), incluyendo metadatos de auditoría en las filas iniciales.
 */
export function exportTableToXlsx(
  headers: string[],
  rows: string[][],
  filename: string,
  sheetName = 'Datos',
  metadata?: ExportMetadata
): void {
  const allRows: (string | number | boolean | null | undefined)[][] = []
  if (metadata) {
    allRows.push(['REPORTE CONFIDENCIAL - ELECTRONIC HEALTH RECORD'])
    allRows.push(['Generado por:', metadata.user])
    allRows.push(['Rol:', metadata.role])
    allRows.push(['Fecha y hora:', metadata.dateTime])
    allRows.push(['Aviso de seguridad:', metadata.disclaimer])
    allRows.push([]) // Fila vacía de separación
  }
  allRows.push(headers)
  rows.forEach((row) => allRows.push(row))

  exportRowsToXlsx(allRows, `${filename}.xlsx`, sheetName)
}

/**
 * Exporta una tabla genérica a PDF estilizado con metadatos y aviso legal de seguridad en el encabezado.
 */
export function exportTableToPdf(
  headers: string[],
  rows: string[][],
  filename: string,
  title?: string,
  metadata?: ExportMetadata
): void {
  const doc = new jsPDF()
  let y = 15

  if (title) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), 14, y)
    y += 8
  }

  if (metadata) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    doc.text(`Generado por: ${metadata.user}  |  Rol: ${metadata.role}`, 14, y)
    y += 5
    doc.text(`Fecha y hora de exportación: ${metadata.dateTime}`, 14, y)
    y += 7

    // Disclaimer legal
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'oblique')
    doc.setTextColor(120, 120, 120)
    const splitDisclaimer = doc.splitTextToSize(metadata.disclaimer, 182)
    doc.text(splitDisclaimer, 14, y)
    y += (splitDisclaimer.length * 3.5) + 4
  }

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    styles: { fontSize: 8.5 },
    headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
  })

  doc.save(`${filename}.pdf`)
}

