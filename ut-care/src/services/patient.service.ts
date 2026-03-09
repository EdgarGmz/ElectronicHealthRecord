import { api } from '@/lib/api'
import type { Patient, PatientsResponse } from '@/types/patient'

export interface CreatePatientInput {
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  patientType: string
  careerId: string
  phone?: string
  enrollmentNumber?: string
  maritalStatus?: string
  guardianName?: string
  guardianPhone?: string
  group?: string
  occupation?: string
  trimester?: number
}

export async function createPatient(data: CreatePatientInput): Promise<Patient> {
  const { data: res } = await api.post<{ success: boolean; data: Patient }>('/patients', {
    ...data,
    dateOfBirth: new Date(data.dateOfBirth).toISOString(),
  })
  return res.data
}

export async function getPatients(params: {
  page?: number
  limit?: number
  search?: string
  patientType?: string
} = {}): Promise<PatientsResponse> {
  const { page = 1, limit = 10, search, patientType } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search?.trim()) sp.set('search', search.trim())
  if (patientType) sp.set('patientType', patientType)
  const { data } = await api.get<{ success: boolean; data: PatientsResponse }>(`/patients?${sp}`)
  return data.data
}

export async function getPatientById(id: string): Promise<Patient> {
  const { data } = await api.get<{ success: boolean; data: Patient }>(`/patients/${id}`)
  return data.data
}
