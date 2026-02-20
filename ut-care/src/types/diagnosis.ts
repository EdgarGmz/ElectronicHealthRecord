// The diagnoses are directly part of the PsychologyRecord.
// We might not need a separate interface if we fetch the PsychologyRecord itself.

import { User } from "./auth";

export interface PsychologyRecordDetails {
  id: string;
  medicalRecordId: string;
  initialEvaluationDate?: string;
  chiefComplaint?: string;
  psychologicalHistory?: string;
  psychiatricHistory?: string;
  substanceUse?: string;
  suicideRiskLevel: string;
  violenceRiskLevel: string;
  currentDiagnosisDsm5?: string; // DSM-5 diagnosis
  currentDiagnosisCie10?: string; // CIE-10 diagnosis
  supportNetwork?: string;
  assignedPsychologistId?: string;
  createdAt: string;
  updatedAt: string;

  // Relations (optional, for display purposes)
  assignedPsychologist?: User;
}

// If we need a form to update/add a diagnosis, it would look something like this:
export interface UpdatePsychologyRecordDiagnosisInput {
  currentDiagnosisDsm5?: string;
  currentDiagnosisCie10?: string;
  // Potentially other fields related to diagnosis update in the psychology record
}
