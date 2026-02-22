import type { User } from "./auth";

export interface Document {
  id: string;
  patientId: string;
  medicalRecordId?: string; // Could be linked to medical record as well
  fileName: string;
  fileUrl: string;
  fileType: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;

  // Relations
  uploadedByUser: User;
}

export interface UploadDocumentInput {
  patientId: string;
  medicalRecordId?: string;
  file: File; // File object to be sent via FormData
  description?: string;
}
