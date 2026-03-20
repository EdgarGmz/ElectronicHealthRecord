import { api } from '@/lib/api'

export interface NursingKpis {
  patientsAttended: number
  suppliesConsumed: number
}

export interface NursingKpisResponse {
  day: NursingKpis
  week: NursingKpis
  year: NursingKpis
}

export async function getNursingKpis(): Promise<NursingKpisResponse> {
  const { data } = await api.get<{ success: boolean; data: NursingKpisResponse }>('/dashboard/nursing-kpis')
  return data.data
}

