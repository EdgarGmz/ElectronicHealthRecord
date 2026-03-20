import { api } from '@/lib/api'
import type {
  Interconsultation,
  InterconsultationsResponse,
  CreateInterconsultationInput,
} from '@/types/interconsultation'

export interface InterconsultationProfessional {
  id: string
  firstName: string
  lastName: string
  email?: string
  role?: string
}

export async function getInterconsultations(params: {
  page?: number
  limit?: number
  patientId?: string
  fromDepartment?: string
  toDepartment?: string
  status?: string
  urgency?: string
  fromProfessionalId?: string
  toProfessionalId?: string
} = {}): Promise<InterconsultationsResponse> {
  const {
    page = 1,
    limit = 10,
    patientId,
    fromDepartment,
    toDepartment,
    status,
    urgency,
    fromProfessionalId,
    toProfessionalId,
  } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (patientId) sp.set('patientId', patientId)
  if (fromDepartment) sp.set('fromDepartment', fromDepartment)
  if (toDepartment) sp.set('toDepartment', toDepartment)
  if (status) sp.set('status', status)
  if (urgency) sp.set('urgency', urgency)
  if (fromProfessionalId) sp.set('fromProfessionalId', fromProfessionalId)
  if (toProfessionalId) sp.set('toProfessionalId', toProfessionalId)
  const { data } = await api.get<{ success: boolean; data: InterconsultationsResponse }>(
    `/interconsultations?${sp}`
  )
  return data.data
}

export async function getInterconsultationById(id: string): Promise<Interconsultation> {
  const { data } = await api.get<{ success: boolean; data: Interconsultation }>(
    `/interconsultations/${id}`
  )
  return data.data
}

export async function getPendingInterconsultationsCount(): Promise<{ count: number }> {
  const { data } = await api.get<{ success: boolean; data: { count: number } }>(
    '/interconsultations/pending-count'
  )
  return data.data
}

export async function createInterconsultation(
  body: CreateInterconsultationInput
): Promise<Interconsultation> {
  const { data } = await api.post<{ success: boolean; data: Interconsultation }>(
    '/interconsultations',
    body
  )
  return data.data
}

export async function respondToInterconsultation(
  id: string,
  response: string
): Promise<Interconsultation> {
  const { data } = await api.post<{ success: boolean; data: Interconsultation }>(
    `/interconsultations/${id}/response`,
    { response }
  )
  return data.data
}

export async function getInterconsultationProfessionals(params: { toDepartment: string }): Promise<InterconsultationProfessional[]> {
  const sp = new URLSearchParams({ toDepartment: params.toDepartment })
  const { data } = await api.get<{ success: boolean; data: InterconsultationProfessional[] }>(
    `/interconsultations/professionals?${sp}`
  )
  return data.data
}
