import { api } from '@/lib/api'
import type { MedicalRecord } from '@/types/medical-record'

/**
 * Get the full medical record (expediente) for a patient by patient ID.
 * Requires roles that can access medical records (psychology coord/psychologist, nursing coord/nurse).
 */
export async function getMedicalRecordByPatientId(patientId: string): Promise<MedicalRecord> {
  const { data } = await api.get<{ success: boolean; data: MedicalRecord }>(
    `/medical-records/patient/${patientId}`
  )
  return data.data
}

/**
 * Get medical record by its own ID (e.g. when you already have the record id).
 */
export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  const { data } = await api.get<{ success: boolean; data: MedicalRecord }>(
    `/medical-records/${id}`
  )
  return data.data
}
