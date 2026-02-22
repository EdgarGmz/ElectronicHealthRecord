import api from './api';
import type { AuthResponse } from '@/types/auth';

export const login = async (data: any): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getProfile = async (): Promise<AuthResponse['user']> => {
  const response = await api.get<AuthResponse['user']>('/auth/profile');
  return response.data;
};
