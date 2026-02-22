import api from './api';
import type { Prescription } from '@/types/medication';

/**
 * Fetches all prescriptions for a specific patient.
 * @param patientId The ID of the patient.
 */
export const getPrescriptionsByPatientId = async (patientId: string): Promise<Prescription[]> => {
  const response = await api.get<Prescription[]>(`/prescriptions/patient/${patientId}`);
  return response.data;
};

/**
 * Creates a new prescription.
 * @param data The data for the new prescription.
 */
export const createPrescription = async (data: any): Promise<Prescription> => {
  const response = await api.post<Prescription>('/prescriptions', data);
  return response.data;
};

/**
 * Fetches all available medications for selection.
 */
export const getAllMedications = async (): Promise<any[]> => {
    const response = await api.get<any[]>('/medications');
    return response.data;
}

/**
 * Fetches the count of pending medication administrations for a specific nurse.
 * "Pending" might mean scheduled for today and not yet administered.
 * @param nurseId The ID of the nurse.
 */
export const getNursePendingMedicationAdministrationsCount = async (nurseId: string): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>(`/medication-administrations/nurse/${nurseId}/pending/count`);
  return response.data;
};
