import { api } from '@/lib/api'
import type { Appointment, AppointmentsResponse } from '@/types/appointment'

export interface AppointmentProfessional {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface CreateAppointmentInput {
  patientId: string
  professionalId: string
  appointmentType: string
  department: string
  scheduledDate: string
  durationMinutes: number
  notes?: string
}

export async function getAppointmentProfessionals(): Promise<AppointmentProfessional[]> {
  const { data } = await api.get<{ success: boolean; data: AppointmentProfessional[] }>('/appointments/professionals')
  return data.data
}

export async function createAppointment(payload: CreateAppointmentInput): Promise<Appointment> {
  const { data } = await api.post<{ success: boolean; data: Appointment }>('/appointments', {
    ...payload,
    scheduledDate: new Date(payload.scheduledDate).toISOString(),
  })
  return data.data
}

export async function getAppointments(params: {
  page?: number
  limit?: number
  patientId?: string
  status?: string
  search?: string
  department?: string
  startDate?: string
  endDate?: string
} = {}): Promise<AppointmentsResponse> {
  const { page = 1, limit = 10, patientId, status, search, department, startDate, endDate } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (patientId) sp.set('patientId', patientId)
  if (status) sp.set('status', status)
  if (search?.trim()) sp.set('search', search.trim())
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

export async function cancelAppointment(id: string, cancellationReason: string): Promise<Appointment> {
  const { data } = await api.delete<{ success: boolean; data: Appointment }>(`/appointments/${id}`, {
    data: { cancellationReason },
  })
  return data.data
}

export async function rescheduleAppointment(
  id: string,
  scheduledDate: string,
  rescheduleReason: string
): Promise<Appointment> {
  const { data } = await api.put<{ success: boolean; data: Appointment }>(`/appointments/${id}`, {
    scheduledDate: scheduledDate,
    rescheduleReason,
  })
  return data.data
}

export interface WaitingListEntry {
  id: string
  patientId: string
  department: string
  preferredProfessionalId?: string
  requestedDate?: string
  priority: string
  reason?: string
  status: string
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    career?: {
      id: string
      name: string
    }
    user: {
      firstName: string
      lastName: string
      email: string
      phone?: string
    }
  }
}

export async function getQueue(): Promise<WaitingListEntry[]> {
  const { data } = await api.get<{ success: boolean; data: WaitingListEntry[] }>('/appointments/queue')
  return data.data
}

export async function updateWaitingListStatus(id: string, status: string): Promise<WaitingListEntry> {
  const { data } = await api.put<{ success: boolean; data: WaitingListEntry }>(`/appointments/queue/${id}/status`, {
    status,
  })
  return data.data
}
