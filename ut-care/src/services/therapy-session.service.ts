import { api } from '@/lib/api'
import type { TherapySession, TherapySessionsResponse, CreateTherapySessionInput } from '@/types/therapy-session'

export async function getTherapySessions(params: {
  page?: number
  limit?: number
  patientId?: string
  therapistId?: string
  psychologyRecordId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
} = {}): Promise<TherapySessionsResponse> {
  const { page = 1, limit = 10, patientId, therapistId, psychologyRecordId, dateFrom, dateTo, search } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (patientId) sp.set('patientId', patientId)
  if (therapistId) sp.set('therapistId', therapistId)
  if (psychologyRecordId) sp.set('psychologyRecordId', psychologyRecordId)
  if (dateFrom) sp.set('dateFrom', dateFrom)
  if (dateTo) sp.set('dateTo', dateTo)
  if (search?.trim()) sp.set('search', search.trim())
  const { data } = await api.get<{ success: boolean; data: TherapySessionsResponse }>(`/therapy-sessions?${sp}`)
  return data.data
}

export async function createTherapySession(payload: CreateTherapySessionInput): Promise<TherapySession> {
  const { data } = await api.post<{ success: boolean; data: TherapySession }>('/therapy-sessions', payload)
  return data.data
}

export async function getTherapySessionById(id: string): Promise<TherapySession> {
  const { data } = await api.get<{ success: boolean; data: TherapySession }>(`/therapy-sessions/${id}`)
  return data.data
}
