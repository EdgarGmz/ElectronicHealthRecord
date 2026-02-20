import api from './api';

/**
 * Fetches the count of patients in the waiting list.
 */
export const getWaitingListCount = async (): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>('/waiting-list/count');
  return response.data;
};
