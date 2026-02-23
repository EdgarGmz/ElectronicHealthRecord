import { api } from '@/lib/api'
import type { TherapySession, TherapySessionsResponse } from '@/types/therapy-session'

export async function getTherapySessions(params: { page?: number; limit?: number } = {}): Promise<TherapySessionsResponse> {
  const { page = 1, limit = 10 } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  const { data } = await api.get<{ success: boolean; data: TherapySessionsResponse }>(`/therapy-sessions?${sp}`)
  return data.data
}

export async function getTherapySessionById(id: string): Promise<TherapySession> {
  const { data } = await api.get<{ success: boolean; data: TherapySession }>(`/therapy-sessions/${id}`)
  return data.data
}
