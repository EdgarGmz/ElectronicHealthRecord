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

/**
 * Ensure the patient has a medical record (and psychology record if current user is psychologist).
 * Creates whatever is missing so a session can be registered. Returns the full medical record.
 */
export async function ensureExpedientForPatient(patientId: string): Promise<MedicalRecord> {
  const { data } = await api.post<{ success: boolean; data: MedicalRecord }>(
    '/medical-records/ensure-for-patient',
    { patientId }
  )
  return data.data
}
