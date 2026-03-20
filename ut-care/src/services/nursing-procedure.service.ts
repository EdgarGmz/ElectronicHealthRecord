import { api } from '@/lib/api'
import type {
  NursingProcedure,
  NursingProceduresResponse,
  CreateNursingProcedureInput,
} from '@/types/nursing-procedure'

export async function getNursingProcedures(params: {
  page?: number
  limit?: number
  search?: string
  procedureType?: string
  patientId?: string
  nursingConsultationId?: string
} = {}): Promise<NursingProceduresResponse> {
  const { page = 1, limit = 10, search, procedureType, patientId, nursingConsultationId } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search?.trim()) sp.set('search', search.trim())
  if (procedureType) sp.set('procedureType', procedureType)
  if (patientId) sp.set('patientId', patientId)
  if (nursingConsultationId) sp.set('nursingConsultationId', nursingConsultationId)
  const { data } = await api.get<{ success: boolean; data: NursingProceduresResponse }>(
    `/nursing-procedures?${sp}`
  )
  return data.data
}

export async function getNursingProcedureById(id: string): Promise<NursingProcedure> {
  const { data } = await api.get<{ success: boolean; data: NursingProcedure }>(
    `/nursing-procedures/${id}`
  )
  return data.data
}

export async function createNursingProcedure(
  body: CreateNursingProcedureInput
): Promise<NursingProcedure> {
  const { data } = await api.post<{ success: boolean; data: NursingProcedure }>(
    '/nursing-procedures',
    body
  )
  return data.data
}

export interface CreateNursingProcedureFromPatientInput {
  procedureType: string
  procedureDate: string
  description: string
  materialsUsed?: string
  observations?: string
}

export async function createNursingProcedureFromPatient(
  patientId: string,
  body: CreateNursingProcedureFromPatientInput
): Promise<NursingProcedure> {
  const { data } = await api.post<{ success: boolean; data: NursingProcedure }>(
    '/nursing-procedures/from-patient',
    { patientId, ...body }
  )
  return data.data
}
