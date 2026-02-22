import api from './api';
import type { PsychologyRecordDetails, UpdatePsychologyRecordDiagnosisInput } from '@/types/diagnosis';

/**
 * Fetches the psychology record for a specific medical record.
 * This record contains the DSM-5 and CIE-10 diagnoses.
 * @param medicalRecordId The ID of the medical record.
 */
export const getPsychologyRecordByMedicalRecordId = async (medicalRecordId: string): Promise<PsychologyRecordDetails> => {
  const response = await api.get<PsychologyRecordDetails>(`/psychology-records/medical-record/${medicalRecordId}`);
  return response.data;
};

/**
 * Updates diagnosis information within a psychology record.
 * @param psychologyRecordId The ID of the psychology record to update.
 * @param data The diagnosis data to update.
 */
export const updatePsychologyRecordDiagnosis = async (psychologyRecordId: string, data: UpdatePsychologyRecordDiagnosisInput): Promise<PsychologyRecordDetails> => {
  const response = await api.patch<PsychologyRecordDetails>(`/psychology-records/${psychologyRecordId}/diagnosis`, data);
  return response.data;
};
