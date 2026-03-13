import { api } from '@/lib/api'
import type { DashboardChartData, PeriodType } from '@/types/dashboard-charts'

export interface DashboardChartParams {
  periodType: PeriodType
  startDate: string
  endDate: string
}

export async function getDashboardChartData(
  params: DashboardChartParams
): Promise<DashboardChartData> {
  const { data } = await api.get<{ success: boolean; data: DashboardChartData }>(
    '/dashboard/chart-data',
    { params }
  )
  return data.data
}
