import { api } from '@/lib/api'

export type NursingStaffProgressPeriod = 'week' | 'month' | 'year'

export interface NursingStaffProgressItem {
  nurseId: string
  firstName: string
  lastName: string
  isActive: boolean
  patientsAttended: number
  consultationsCount: number
  proceduresCount: number
  medicationAdministrationsCount: number
}

export async function getNursingStaffProgress(
  period: NursingStaffProgressPeriod = 'month'
): Promise<{ progress: NursingStaffProgressItem[]; period: NursingStaffProgressPeriod }> {
  const { data } = await api.get<{
    success: boolean
    data: { progress: NursingStaffProgressItem[]; period: NursingStaffProgressPeriod }
  }>(`/dashboard/nursing-staff-progress?period=${period}`)

  return data.data
}

