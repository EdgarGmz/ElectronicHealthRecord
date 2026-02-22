import type { User } from "./auth";
import type { Patient } from "./patient";

export interface Interconsultation {
  id: string;
  patientId: string;
  fromDepartment: string;
  toDepartment: string;
  fromProfessionalId: string;
  toProfessionalId?: string;
  reason: string;
  relevantInformation?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'responded' | 'cancelled';
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  patient: Patient;
  fromProfessional: User;
  toProfessional?: User;
  respondedByUser?: User;
}

export interface CreateInterconsultationInput {
  patientId: string;
  fromDepartment: string;
  toDepartment: string;
  fromProfessionalId: string; // The ID of the logged-in user
  toProfessionalId?: string;
  reason: string;
  relevantInformation?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}
