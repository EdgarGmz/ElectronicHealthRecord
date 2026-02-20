import { User } from "./auth";

export interface TherapySession {
  id: string;
  psychologyRecordId: string;
  sessionNumber: number;
  sessionDate: string;
  sessionDuration: number;
  mood: string;
  evolutionNotes?: string;
  patientProgress?: string;
  assignedTasks?: string;
  observations?: string;
  nextSessionPlan?: string;
  therapistId: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  therapist: User;
}

export interface CreateTherapySessionInput {
  psychologyRecordId: string;
  sessionDate: string;
  sessionDuration?: number;
  mood: string;
  evolutionNotes: string;
  patientProgress: string;
  assignedTasks?: string;
  observations?: string;
  therapistId: string; // This should be the logged-in user's ID
}
