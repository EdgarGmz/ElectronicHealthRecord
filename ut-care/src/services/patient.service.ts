import api from './api';
import { Patient, PatientPaginatedResponse } from '@/types/patient';

export const getPatients = async (page = 1, limit = 10, filter = ''): Promise<PatientPaginatedResponse> => {
  const response = await api.get<PatientPaginatedResponse>('/patients', {
    params: { page, limit, filter },
  });
  return response.data;
};

export const getPatientById = async (id: string): Promise<Patient> => {
  const response = await api.get<Patient>(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (data: any): Promise<Patient> => {
  const response = await api.post<Patient>('/patients', data);
  return response.data;
};

export const updatePatient = async (id: string, data: any): Promise<Patient> => {
  const response = await api.put<Patient>(`/patients/${id}`, data);
  return response.data;
};

export const getTotalPatients = async (): Promise<{ total: number }> => {
  const response = await api.get<{ total: number }>('/patients/count');
  return response.data;
};

/**
 * Fetches the count of patients registered today.
 */
export const getNewPatientsTodayCount = async (): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>('/patients/new-today/count');
  return response.data;
};

/**
 * Fetches the count of patients assigned to a specific psychologist.
 * @param psychologistId The ID of the psychologist.
 */
export const getPsychologistPatientsCount = async (psychologistId: string): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>(`/patients/psychologist/${psychologistId}/count`);
  return response.data;
};
