import apiClient from './api';
import type { MedicalRecord, ApiResponse, MedicalRecordFormData } from '../types';

export const medicalRecordService = {
  // Get medical record by ID
  async getById(id: string): Promise<MedicalRecord> {
    const response = await apiClient.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`);
    return response.data.data;
  },

  // Get medical record by patient ID
  async getByPatientId(patientId: string): Promise<MedicalRecord | null> {
    try {
      const response = await apiClient.get<ApiResponse<MedicalRecord>>(`/medical-records`, {
        params: { patientId }
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Update medical record
  async update(id: string, data: MedicalRecordFormData): Promise<MedicalRecord> {
    const response = await apiClient.put<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, data);
    return response.data.data;
  },

  // Create medical record
  async create(patientId: string, data: MedicalRecordFormData): Promise<MedicalRecord> {
    const response = await apiClient.post<ApiResponse<MedicalRecord>>('/medical-records', {
      patientId,
      ...data,
    });
    return response.data.data;
  },
};
