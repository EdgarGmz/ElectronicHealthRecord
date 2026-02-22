import type { User } from "./auth";
import type { Patient } from "./patient";

export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  appointmentType: string;
  department: string;
  scheduledDate: string;
  durationMinutes: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  cancellationReason?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  patient: Patient;
  professional: User;
}
