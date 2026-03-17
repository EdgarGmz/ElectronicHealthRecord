import { api } from '@/lib/api'
import type { PeriodType } from '@/types/dashboard-charts'

export interface NursingPatientsSeriesPoint {
  period: string
  count: number
}

export async function getNursingPatientsSeries(params: {
  periodType: PeriodType
  startDate: string
  endDate: string
  careerId?: string
  includeGeneral?: boolean
  sex?: 'male' | 'female'
}): Promise<NursingPatientsSeriesPoint[]> {
  const { data } = await api.get<{ success: boolean; data: { series: NursingPatientsSeriesPoint[] } }>(
    '/dashboard/nursing-patients-series',
    { params }
  )
  return data.data.series
}

