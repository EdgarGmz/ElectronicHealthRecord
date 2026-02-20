import api from './api';
import { PsychometricEvaluation, CreatePsychometricEvaluationInput } from '@/types/psychometric-evaluation';
import { UpdatePsychometricEvaluationInput } from '@/types/psychometric-evaluation.update.schema';

/**
 * Fetches all psychometric evaluations for a specific psychology record.
 * @param psychologyRecordId The ID of the psychology record.
 */
export const getPsychometricEvaluationsByRecordId = async (psychologyRecordId: string): Promise<PsychometricEvaluation[]> => {
  const response = await api.get<PsychometricEvaluation[]>(`/psychometric-evaluations/record/${psychologyRecordId}`);
  return response.data;
};

/**
 * Creates a new psychometric evaluation.
 * @param data The data for the new psychometric evaluation.
 */
export const createPsychometricEvaluation = async (data: CreatePsychometricEvaluationInput): Promise<PsychometricEvaluation> => {
  const response = await api.post<PsychometricEvaluation>('/psychometric-evaluations', data);
  return response.data;
};

/**
 * Fetches the count of psychometric evaluations administered by a specific professional.
 * @param administeredById The ID of the professional who administered the evaluations.
 */
export const getAdministeredEvaluationsCount = async (administeredById: string): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>(`/psychometric-evaluations/administered-by/${administeredById}/count`);
  return response.data;
};

/**
 * Updates an existing psychometric evaluation.
 * @param evaluationId The ID of the psychometric evaluation to update.
 * @param data The data to update for the psychometric evaluation.
 */
export const updatePsychometricEvaluation = async (evaluationId: string, data: UpdatePsychometricEvaluationInput): Promise<PsychometricEvaluation> => {
  const response = await api.patch<PsychometricEvaluation>(`/psychometric-evaluations/${evaluationId}`, data);
  return response.data;
};
