import api from './api';

export interface Career {
  id: string;
  name: string;
  code: string;
}

export const getCareers = async (): Promise<Career[]> => {
  const response = await api.get<any>('/careers'); // We'll check if this endpoint exists
  return response.data.data;
};
