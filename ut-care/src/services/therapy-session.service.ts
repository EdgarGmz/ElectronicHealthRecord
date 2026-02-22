import api from './api';
import type { TherapySession, CreateTherapySessionInput } from '@/types/therapy-session';
import type { UpdateTherapySessionInput } from '@/types/therapy-session.update.schema';

/**
 * Fetches all therapy sessions for a specific psychology record.
 * @param psychologyRecordId The ID of the psychology record.
 */
export const getTherapySessionsByRecordId = async (psychologyRecordId: string): Promise<TherapySession[]> => {
  const response = await api.get<TherapySession[]>(`/therapy-sessions/record/${psychologyRecordId}`);
  return response.data;
};

/**
 * Creates a new therapy session.
 * @param data The data for the new therapy session.
 */
export const createTherapySession = async (data: CreateTherapySessionInput): Promise<TherapySession> => {
  const response = await api.post<TherapySession>('/therapy-sessions', data);
  return response.data;
};

/**
 * Fetches the count of pending therapy sessions for a specific therapist.
 * "Pending" might mean sessions scheduled for today/future or sessions that need notes.
 * For now, I'll assume it means sessions where notes might be pending or future sessions.
 * The backend would define the exact logic for "pending".
 * @param therapistId The ID of the therapist.
 */
export const getTherapistPendingSessionsCount = async (therapistId: string): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>(`/therapy-sessions/therapist/${therapistId}/pending/count`);
  return response.data;
};

/**
 * Fetches a single therapy session by its ID.
 * @param sessionId The ID of the therapy session.
 */
export const getTherapySessionById = async (sessionId: string): Promise<TherapySession> => {
  const response = await api.get<TherapySession>(`/therapy-sessions/${sessionId}`);
  return response.data;
};

/**
 * Updates an existing therapy session.
 * @param sessionId The ID of the therapy session to update.
 * @param data The data to update for the therapy session.
 */
export const updateTherapySession = async (sessionId: string, data: UpdateTherapySessionInput): Promise<TherapySession> => {
  const response = await api.patch<TherapySession>(`/therapy-sessions/${sessionId}`, data);
  return response.data;
};
