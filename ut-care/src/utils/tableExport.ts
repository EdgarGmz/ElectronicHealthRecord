import jsPDF from 'jspdf'
import { applyPlugin, autoTable } from 'jspdf-autotable'
import { exportRowsToXlsx } from '@/utils/xlsxExport'

applyPlugin(jsPDF)

/**
 * Exporta una tabla genérica a CSV.
 * @param headers - Nombres de columnas
 * @param rows - Filas (cada fila es un array de cadenas)
 * @param filename - Nombre del archivo sin extensión
 */
export function exportTableToCsv(
  headers: string[],
  rows: string[][],
  filename: string
): void {
  const escape = (cell: string) => {
    const s = String(cell ?? '')
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const line = (row: string[]) => row.map(escape).join(',')
  const csv = [line(headers), ...rows.map(line)].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Exporta una tabla genérica a Excel (XLSX).
 */
export function exportTableToXlsx(
  headers: string[],
  rows: string[][],
  filename: string,
  sheetName = 'Datos'
): void {
  exportRowsToXlsx([headers, ...rows], `${filename}.xlsx`, sheetName)
}

/**
 * Exporta una tabla genérica a PDF.
 */
export function exportTableToPdf(
  headers: string[],
  rows: string[][],
  filename: string,
  title?: string
): void {
  const doc = new jsPDF()
  let y = 15
  if (title) {
    doc.setFontSize(14)
    doc.text(title, 14, y)
    y += 10
  }
  doc.setFontSize(10)
  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
  })
  doc.save(`${filename}.pdf`)
}
