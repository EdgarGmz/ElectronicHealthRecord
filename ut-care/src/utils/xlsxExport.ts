import ExcelJS from 'exceljs'

type XlsxCellValue = string | number | boolean | null | undefined

/**
 * Export rows to an XLSX file in browser environments.
 */
export function exportRowsToXlsx(
  rows: XlsxCellValue[][],
  filename: string,
  sheetName = 'Datos'
): void {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)

  rows.forEach((row) => {
    sheet.addRow(row.map((value) => value ?? ''))
  })

  void workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  })
}