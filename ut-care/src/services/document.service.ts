import api from './api';
import type { Document, UploadDocumentInput } from '@/types/document';
import type { UpdateDocumentInput } from '@/types/document.update.schema';

/**
 * Fetches all documents for a specific patient.
 * @param patientId The ID of the patient.
 */
export const getDocumentsByPatientId = async (patientId: string): Promise<Document[]> => {
  const response = await api.get<Document[]>(`/documents/patient/${patientId}`);
  return response.data;
};

/**
 * Uploads a new document for a patient.
 * @param data The data for the new document, including the file.
 */
export const uploadDocument = async (data: UploadDocumentInput): Promise<Document> => {
  const formData = new FormData();
  formData.append('patientId', data.patientId);
  if (data.medicalRecordId) {
    formData.append('medicalRecordId', data.medicalRecordId);
  }
  formData.append('file', data.file);
  if (data.description) {
    formData.append('description', data.description);
  }

  const response = await api.post<Document>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Updates an existing document's metadata.
 * @param documentId The ID of the document to update.
 * @param data The data to update for the document (e.g., description).
 */
export const updateDocument = async (documentId: string, data: UpdateDocumentInput): Promise<Document> => {
  const response = await api.patch<Document>(`/documents/${documentId}`, data);
  return response.data;
};
