import api from './api';
import { Interconsultation, CreateInterconsultationInput } from '@/types/interconsultation';
import { UpdateInterconsultationInput } from '@/types/interconsultation.update.schema';

/**
 * Fetches all interconsultations for a specific patient.
 * @param patientId The ID of the patient.
 */
export const getInterconsultationsByPatientId = async (patientId: string): Promise<Interconsultation[]> => {
  const response = await api.get<Interconsultation[]>(`/interconsultations/patient/${patientId}`);
  return response.data;
};

/**
 * Creates a new interconsultation.
 * @param data The data for the new interconsultation.
 */
export const createInterconsultation = async (data: CreateInterconsultationInput): Promise<Interconsultation> => {
  const response = await api.post<Interconsultation>('/interconsultations', data);
  return response.data;
};

/**
 * Fetches the count of pending interconsultations for a specific professional.
 * @param professionalId The ID of the professional.
 */
export const getPendingInterconsultationsForProfessionalCount = async (professionalId: string): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>(`/interconsultations/professional/${professionalId}/pending/count`);
  return response.data;
};

/**
 * Updates an existing interconsultation.
 * @param interconsultationId The ID of the interconsultation to update.
 * @param data The data to update for the interconsultation.
 */
export const updateInterconsultation = async (interconsultationId: string, data: UpdateInterconsultationInput): Promise<Interconsultation> => {
  const response = await api.patch<Interconsultation>(`/interconsultations/${interconsultationId}`, data);
  return response.data;
};
