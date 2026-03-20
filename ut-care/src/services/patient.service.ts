import { api } from '@/lib/api'
import type { Patient, PatientsResponse } from '@/types/patient'

export interface CreatePatientInput {
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  patientType: string
  // Optional medical record fields
  bloodType?: string | null
  allergies?: string | null
  chronicConditions?: string | null
  currentMedications?: string | null
  familyHistory?: string | null
  /** Required when patientType is 'student'. Omit for faculty/administrative. */
  careerId?: string
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
  careerId?: string
} = {}): Promise<PatientsResponse> {
  const { page = 1, limit = 10, search, patientType, careerId } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search?.trim()) sp.set('search', search.trim())
  if (patientType) sp.set('patientType', patientType)
  if (careerId?.trim()) sp.set('careerId', careerId.trim())
  const { data } = await api.get<{ success: boolean; data: PatientsResponse }>(`/patients?${sp}`)
  return data.data
}

export async function getPatientById(id: string): Promise<Patient> {
  const { data } = await api.get<{ success: boolean; data: Patient }>(`/patients/${id}`)
  return data.data
}

export interface UpdatePatientInput {
  email?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  patientType?: string
  careerId?: string | null
  phone?: string
  enrollmentNumber?: string
  maritalStatus?: string
  guardianName?: string
  guardianPhone?: string
  group?: string
  occupation?: string
  trimester?: number
}

export async function updatePatient(id: string, data: UpdatePatientInput): Promise<Patient> {
  const payload = { ...data }
  if (payload.dateOfBirth) payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString()
  const { data: res } = await api.put<{ success: boolean; data: Patient }>(`/patients/${id}`, payload)
  return res.data
}

export async function deletePatient(id: string): Promise<void> {
  await api.delete(`/patients/${id}`)
}
