import { api } from '@/lib/api'
import type {
  StatisticsReportData,
  ConsultationsReportData,
  DiagnosesReportData,
} from '@/types/report'

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function getStatisticsReport(params: {
  periodStart: Date
  periodEnd: Date
  department?: string
}): Promise<{ report: unknown; data: StatisticsReportData }> {
  const sp = new URLSearchParams({
    periodStart: toISO(params.periodStart),
    periodEnd: toISO(params.periodEnd),
  })
  if (params.department) sp.set('department', params.department)
  const { data } = await api.get<{ success: boolean; data: { report: unknown; data: StatisticsReportData } }>(
    `/reports/statistics?${sp}`
  )
  return data.data
}

export async function getConsultationsReport(params: {
  periodStart: Date
  periodEnd: Date
  department?: string
}): Promise<{ report: unknown; data: ConsultationsReportData }> {
  const sp = new URLSearchParams({
    periodStart: toISO(params.periodStart),
    periodEnd: toISO(params.periodEnd),
  })
  if (params.department) sp.set('department', params.department)
  const { data } = await api.get<{ success: boolean; data: { report: unknown; data: ConsultationsReportData } }>(
    `/reports/consultations?${sp}`
  )
  return data.data
}

export async function getDiagnosesReport(params: {
  periodStart: Date
  periodEnd: Date
  department?: string
}): Promise<{ report: unknown; data: DiagnosesReportData }> {
  const sp = new URLSearchParams({
    periodStart: toISO(params.periodStart),
    periodEnd: toISO(params.periodEnd),
  })
  if (params.department) sp.set('department', params.department)
  const { data } = await api.get<{ success: boolean; data: { report: unknown; data: DiagnosesReportData } }>(
    `/reports/diagnoses?${sp}`
  )
  return data.data
}
