import { Patient } from "./patient";
import { User } from "./auth";

export interface WaitingListEntry {
  id: string;
  patientId: string;
  department: string;
  preferredProfessionalId?: string;
  requestedDate?: string;
  priority: string;
  reason?: string;
  status: 'pending' | 'assigned' | 'cancelled';
  createdAt: string;
  updatedAt: string;

  // Relations
  patient: Patient;
  preferredProfessional?: User;
}
