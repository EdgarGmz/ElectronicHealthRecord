import api from './api';
import { Appointment } from '@/types/appointment';

/**
 * Fetches all appointments for a specific patient.
 * @param patientId The ID of the patient.
 */
export const getAppointmentsByPatientId = async (patientId: string): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(`/appointments/patient/${patientId}`);
  return response.data;
};

/**
 * Creates a new appointment.
 * @param data The data for the new appointment.
 */
export const createAppointment = async (data: any): Promise<Appointment> => {
  const response = await api.post<Appointment>('/appointments', data);
  return response.data;
};

/**
 * Fetches the count of appointments scheduled for today.
 */
export const getAppointmentsTodayCount = async (): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>('/appointments/today/count');
  return response.data;
};

/**
 * Fetches appointments for a specific professional scheduled for today.
 * @param professionalId The ID of the professional.
 */
export const getProfessionalAppointmentsToday = async (professionalId: string): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(`/appointments/professional/${professionalId}/today`);
  return response.data;
};

/**
 * Fetches the count of pending appointment confirmations.
 */
export const getPendingAppointmentConfirmationsCount = async (): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>('/appointments/pending-confirmations/count');
  return response.data;
};

/**
 * Fetches a single appointment by its ID.
 * @param appointmentId The ID of the appointment.
 */
export const getAppointmentById = async (appointmentId: string): Promise<Appointment> => {
  const response = await api.get<Appointment>(`/appointments/${appointmentId}`);
  return response.data;
};
