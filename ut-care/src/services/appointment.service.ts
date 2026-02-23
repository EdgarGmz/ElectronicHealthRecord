import { api } from '@/lib/api'
import type { Appointment, AppointmentsResponse } from '@/types/appointment'

export async function getAppointments(params: {
  page?: number
  limit?: number
  status?: string
  department?: string
  startDate?: string
  endDate?: string
} = {}): Promise<AppointmentsResponse> {
  const { page = 1, limit = 10, status, department, startDate, endDate } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) sp.set('status', status)
  if (department) sp.set('department', department)
  if (startDate) sp.set('startDate', startDate)
  if (endDate) sp.set('endDate', endDate)
  const { data } = await api.get<{ success: boolean; data: AppointmentsResponse }>(`/appointments?${sp}`)
  return data.data
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const { data } = await api.get<{ success: boolean; data: Appointment }>(`/appointments/${id}`)
  return data.data
}
