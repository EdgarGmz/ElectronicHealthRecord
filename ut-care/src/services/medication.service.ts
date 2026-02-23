import { api } from '@/lib/api'
import type {
  Medication,
  MedicationWithPrescriptions,
  MedicationsResponse,
  CreateMedicationInput,
  UpdateMedicationInput,
} from '@/types/medication'

export async function getMedications(params: {
  page?: number
  limit?: number
  search?: string
  category?: string
  isActive?: boolean
} = {}): Promise<MedicationsResponse> {
  const { page = 1, limit = 10, search, category, isActive } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search?.trim()) sp.set('search', search.trim())
  if (category) sp.set('category', category)
  if (isActive !== undefined) sp.set('isActive', String(isActive))
  const { data } = await api.get<{ success: boolean; data: MedicationsResponse }>(`/medications?${sp}`)
  return data.data
}

export async function getMedicationById(id: string): Promise<MedicationWithPrescriptions> {
  const { data } = await api.get<{ success: boolean; data: MedicationWithPrescriptions }>(`/medications/${id}`)
  return data.data
}

export async function createMedication(body: CreateMedicationInput): Promise<Medication> {
  const { data } = await api.post<{ success: boolean; data: Medication }>('/medications', body)
  return data.data
}

export async function updateMedication(id: string, body: UpdateMedicationInput): Promise<Medication> {
  const { data } = await api.put<{ success: boolean; data: Medication }>(`/medications/${id}`, body)
  return data.data
}
