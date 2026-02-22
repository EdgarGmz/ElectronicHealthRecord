import api from './api';
import type { NursingConsultation, NursingProcedure, CreateNursingConsultationInput, CreateNursingProcedureInput } from '@/types/nursing-procedure';
import type { UpdateNursingConsultationInput } from '@/types/nursing-consultation.update.schema';
import type { UpdateNursingProcedureInput } from '@/types/nursing-procedure.update.schema';

/**
 * Fetches all nursing consultations for a specific medical record.
 * @param medicalRecordId The ID of the medical record.
 */
export const getNursingConsultationsByMedicalRecordId = async (medicalRecordId: string): Promise<NursingConsultation[]> => {
  const response = await api.get<NursingConsultation[]>(`/nursing-consultations/medical-record/${medicalRecordId}`);
  return response.data;
};

/**
 * Creates a new nursing consultation.
 * @param data The data for the new nursing consultation.
 */
export const createNursingConsultation = async (data: CreateNursingConsultationInput): Promise<NursingConsultation> => {
  const response = await api.post<NursingConsultation>('/nursing-consultations', data);
  return response.data;
};

/**
 * Updates an existing nursing consultation.
 * @param consultationId The ID of the nursing consultation to update.
 * @param data The data to update for the nursing consultation.
 */
export const updateNursingConsultation = async (consultationId: string, data: UpdateNursingConsultationInput): Promise<NursingConsultation> => {
  const response = await api.patch<NursingConsultation>(`/nursing-consultations/${consultationId}`, data);
  return response.data;
};


/**
 * Fetches all nursing procedures for a specific nursing consultation.
 * (This might be nested within the consultation object, but providing a direct API call just in case).
 * @param nursingConsultationId The ID of the nursing consultation.
 */
export const getNursingProceduresByConsultationId = async (nursingConsultationId: string): Promise<NursingProcedure[]> => {
  const response = await api.get<NursingProcedure[]>(`/nursing-consultations/${nursingConsultationId}/procedures`);
  return response.data;
};

/**
 * Creates a new nursing procedure.
 * @param data The data for the new nursing procedure.
 */
export const createNursingProcedure = async (data: CreateNursingProcedureInput): Promise<NursingProcedure> => {
  const response = await api.post<NursingProcedure>('/nursing-procedures', data);
  return response.data;
};

/**
 * Updates an existing nursing procedure.
 * @param procedureId The ID of the nursing procedure to update.
 * @param data The data to update for the nursing procedure.
 */
export const updateNursingProcedure = async (procedureId: string, data: UpdateNursingProcedureInput): Promise<NursingProcedure> => {
  const response = await api.patch<NursingProcedure>(`/nursing-procedures/${procedureId}`, data);
  return response.data;
};


/**
 * Fetches the count of pending nursing procedures for a specific nurse.
 * "Pending" might mean procedures scheduled for today or uncompleted.
 * @param nurseId The ID of the nurse.
 */
export const getNursePendingProceduresCount = async (nurseId: string): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>(`/nursing-procedures/nurse/${nurseId}/pending/count`);
  return response.data;
};
