import type { User } from "./auth";
import { PsychologyRecordDetails } from "./diagnosis"; // Import PsychologyRecordDetails

// New: Nursing Consultation details
export interface NursingConsultationDetails {
  id: string;
  medicalRecordId: string;
  consultationDate: string;
  chiefComplaint?: string;
  nurseId: string;
  // ... other fields from NursingConsultation model in schema.prisma
  nursingProcedures?: NursingProcedure[]; // Assuming procedures are nested
  nurse: User; // Assuming relation to User for nurse details
}

export interface NursingProcedure {
  id: string;
  nursingConsultationId: string;
  procedureType: string;
  procedureDate: string;
  description: string;
  performedBy: string;
  // ... other fields from NursingProcedure model in schema.prisma
  performedByUser: User; // Assuming relation to User for performedBy details
}

// This should align with the Prisma schema's relations
interface MedicalRecord {
  id: string;
  psychologyRecord?: PsychologyRecordDetails;
  nursingConsultations?: NursingConsultationDetails[]; // Add nursing consultations
  // other medical record fields
}

export interface Patient {
  id: string;
  userId: string;
  patientType: string;
  maritalStatus?: string;
  guardianName?: string;
  guardianPhone?: string;
  careerId: string;
  group?: string;
  occupation?: string;
  trimester?: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  career: {
    id: string;
    name: string;
  };
  medicalRecord?: MedicalRecord; // Add medical record relation
}

export interface PatientPaginatedResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
}
