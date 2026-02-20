import api from './api';

export interface Career {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getCareers = async (): Promise<Career[]> => {
  const response = await api.get<Career[]>('/careers');
  return response.data;
};
