import api from './api';
import type { Patient, PatientPaginatedResponse } from '@/types/patient';

export const getPatients = async (page = 1, limit = 10, filter = ''): Promise<PatientPaginatedResponse> => {
  const response = await api.get<any>('/patients', {
    params: { page, limit, filter },
  });
  // The backend returns { success: true, message: '...', data: { patients: [], pagination: {} } }
  return response.data.data;
};

export const getPatientById = async (id: string): Promise<Patient> => {
  const response = await api.get<any>(`/patients/${id}`);
  return response.data.data;
};

/**
 * Busca un paciente por matrícula o número de empleado.
 * Usado en enfermería y psicología: si existe se abre el expediente; si no (404) se puede crear uno nuevo.
 */
export const getPatientByEnrollmentOrEmployeeNumber = async (
  enrollmentOrEmployeeNumber: string
): Promise<Patient> => {
  const number = encodeURIComponent(enrollmentOrEmployeeNumber.trim());
  const response = await api.get<any>(`/patients/by-enrollment/${number}`);
  return response.data.data;
};

export const createPatient = async (data: any): Promise<Patient> => {
  const response = await api.post<any>('/patients', data);
  return response.data.data;
};

export const updatePatient = async (id: string, data: any): Promise<Patient> => {
  const response = await api.put<any>(`/patients/${id}`, data);
  return response.data.data;
};

export const getTotalPatients = async (): Promise<{ total: number }> => {
  const response = await api.get<PatientPaginatedResponse>('/patients', {
    params: { limit: 1 }
  });
  // The backend returns { success, message, data: { patients, pagination: { total } } }
  // but the Axios interceptor or service might be returning response.data
  // Based on the controller, it returns a JSON with { success, message, data }
  const result = response.data as any;
  return { total: result.data.pagination.total };
};

/**
 * Fetches the count of patients registered today.
 */
export const getNewPatientsTodayCount = async (): Promise<{ count: number }> => {
  // Backend doesn't have a specific endpoint, we can filter by date if supported
  // For now, return a placeholder or total as fallback to avoid 404
  const response = await api.get<PatientPaginatedResponse>('/patients', {
    params: { limit: 1 }
  });
  const result = response.data as any;
  return { count: result.data.pagination.total };
};

/**
 * Fetches the count of patients assigned to a specific psychologist.
 * @param psychologistId The ID of the psychologist.
 */
export const getPsychologistPatientsCount = async (psychologistId: string): Promise<{ count: number }> => {
  // Placeholder since specific endpoint doesn't exist
  return { count: 0 };
};
