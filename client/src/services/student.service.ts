import apiClient from './api';
import type { Student, ApiResponse } from '../types/student.types';

export const studentService = {
  /**
   * Get student by ID
   * Note: In the backend, students are stored as "patients"
   */
  async getById(id: string): Promise<Student> {
    const response = await apiClient.get<ApiResponse<Student>>(`/patients/${id}`);
    return response.data.data;
  },

  /**
   * Get all students with optional filters
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    patientType?: string;
  }): Promise<any> {
    const response = await apiClient.get('/patients', { params });
    return response.data.data;
  },
};

export default studentService;
