import apiClient from './api';
import type { Patient, ApiResponse, PaginatedResponse } from '../types';

export const patientService = {
  // Get patient by ID
  async getById(id: string): Promise<Patient> {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.data;
  },

  // Get all patients
  async getAll(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Patient>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Patient>>>('/patients', {
      params: { page, limit, search },
    });
    return response.data.data;
  },
};
