import { api } from '@/lib/api'
import type { User, UsersResponse } from '@/types/user'

/** Psicólogo con carreras asignadas (listado del coordinador). */
export interface PsychologistWithCareers extends User {
  careers?: { id: string; name: string }[]
}

export interface CreatePsychologistInput {
  email: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phone?: string
  enrollmentNumber?: string
}

export interface UpdatePsychologistInput {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  isActive?: boolean
}

export async function getPsychologists(params: {
  page?: number
  limit?: number
  search?: string
} = {}): Promise<{ users: PsychologistWithCareers[]; pagination: UsersResponse['pagination'] }> {
  const { page = 1, limit = 10, search } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search?.trim()) sp.set('search', search.trim())
  const { data } = await api.get<{
    success: boolean
    data: { users: PsychologistWithCareers[]; pagination: UsersResponse['pagination'] }
  }>(`/coordinator-psychology/psychologists?${sp}`)
  return data.data
}

export async function createPsychologist(input: CreatePsychologistInput): Promise<User> {
  const payload = {
    ...input,
    dateOfBirth: new Date(input.dateOfBirth).toISOString(),
  }
  const { data } = await api.post<{ success: boolean; data: User }>(
    '/coordinator-psychology/psychologists',
    payload
  )
  return data.data
}

export async function updatePsychologist(
  id: string,
  input: UpdatePsychologistInput
): Promise<User> {
  const payload: Record<string, unknown> = { ...input }
  if (input.dateOfBirth !== undefined) {
    payload.dateOfBirth = new Date(input.dateOfBirth).toISOString()
  }
  const { data } = await api.put<{ success: boolean; data: User }>(
    `/coordinator-psychology/psychologists/${id}`,
    payload
  )
  return data.data
}

export async function deactivatePsychologist(id: string): Promise<void> {
  await api.delete(`/coordinator-psychology/psychologists/${id}`)
}

/** Elimina permanentemente al psicólogo (y sus asignaciones de carreras). No se puede deshacer. */
export async function deletePsychologistPermanently(id: string): Promise<void> {
  await api.delete(`/coordinator-psychology/psychologists/${id}/permanent`)
}

/** Progreso del personal: métricas por psicólogo en un periodo (week | month | year). */
export type StaffProgressPeriod = 'week' | 'month' | 'year'

export interface StaffProgressItem {
  psychologistId: string
  firstName: string
  lastName: string
  isActive: boolean
  patientsAttended: number
  recordsCount: number
  sessionsCount: number
  appointmentsCompleted: number
  appointmentsCancelled: number
  appointmentsScheduled: number
}

export async function getStaffProgress(
  period: StaffProgressPeriod = 'month'
): Promise<{ progress: StaffProgressItem[]; period: StaffProgressPeriod }> {
  const { data } = await api.get<{
    success: boolean
    data: { progress: StaffProgressItem[]; period: StaffProgressPeriod }
  }>(`/coordinator-psychology/staff-progress?period=${period}`)
  return data.data
}

/** Todas las carreras con asignación (una carrera = un psicólogo). Para el modal y deshabilitar las ya asignadas a otros. */
export interface CareerWithAssignment {
  id: string
  name: string
  code: string | null
  assignedToPsychologistId: string | null
}

export async function getCareersWithAssignments(): Promise<CareerWithAssignment[]> {
  const { data } = await api.get<{
    success: boolean
    data: { careers: CareerWithAssignment[] }
  }>('/coordinator-psychology/careers-with-assignments')
  return data.data.careers
}

/** Carreras asignadas a un psicólogo. */
export async function getPsychologistCareers(psychologistId: string): Promise<string[]> {
  const { data } = await api.get<{ success: boolean; data: { careerIds: string[] } }>(
    `/coordinator-psychology/psychologists/${psychologistId}/careers`
  )
  return data.data.careerIds
}

/** Asignar/desvincular carreras; reemplaza la lista completa. */
export async function setPsychologistCareers(
  psychologistId: string,
  careerIds: string[]
): Promise<string[]> {
  const { data } = await api.put<{ success: boolean; data: { careerIds: string[] } }>(
    `/coordinator-psychology/psychologists/${psychologistId}/careers`,
    { careerIds }
  )
  return data.data.careerIds
}

/** Analytics: consultas (citas + sesiones) en el tiempo. */
export type AnalyticsGroupBy = 'day' | 'week' | 'month'

export interface ConsultationsOverTimeItem {
  date: string
  appointments: number
  sessions: number
  total: number
}

export async function getConsultationsOverTime(
  start: string,
  end: string,
  groupBy: AnalyticsGroupBy = 'day',
  psychologistId?: string
): Promise<ConsultationsOverTimeItem[]> {
  const params = new URLSearchParams({ start, end, groupBy })
  if (psychologistId) params.set('psychologistId', psychologistId)
  const { data } = await api.get<{ success: boolean; data: { series: ConsultationsOverTimeItem[] } }>(
    `/coordinator-psychology/analytics/consultations-over-time?${params}`
  )
  return data.data.series
}

/** Analytics: distribución de carga por psicólogo. */
export interface WorkloadDistributionItem {
  psychologistId: string
  psychologistName: string
  patientsCount: number
  sessionsCount: number
  appointmentsCompleted: number
  hoursApprox: number
}

export async function getWorkloadDistribution(
  start: string,
  end: string
): Promise<WorkloadDistributionItem[]> {
  const { data } = await api.get<{
    success: boolean
    data: { workload: WorkloadDistributionItem[] }
  }>(`/coordinator-psychology/analytics/workload-distribution?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
  return data.data.workload
}
