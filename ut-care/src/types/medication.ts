import type { User } from "./auth";
import type { Patient } from "./patient";

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  category?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  medicationId: string;
  prescribedBy: string;
  dosage: string;
  frequency: string;
  route: string;
  duration?: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;

  // Relations
  medication: Medication;
  prescribedByUser: User;
}

export interface MedicationAdministration {
    id: string;
    prescriptionId: string;
    administrationDate: string;
    administeredBy: string;
    notes?: string;
    
    // Relations
    administeredByUser: User;
}
