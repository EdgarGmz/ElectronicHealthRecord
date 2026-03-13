import { api } from '@/lib/api'
import type { CoordinatorPsychologyDashboardData } from '@/types/coordinator-psychology-dashboard'

export async function getCoordinatorPsychologyDashboard(
  accessToken?: string | null
): Promise<CoordinatorPsychologyDashboardData> {
  const headers: Record<string, string> = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const { data } = await api.get<{
    success: boolean
    data: CoordinatorPsychologyDashboardData
  }>('/dashboard/coordinator-psychology', { headers })
  return data.data
}
