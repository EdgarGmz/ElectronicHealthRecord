import type { User } from "./auth";

export interface PsychometricEvaluation {
  id: string;
  psychologyRecordId: string;
  evaluationType: string;
  applicationDate: string;
  rawScore?: number;
  standardScore?: number;
  percentile?: number;
  interpretation?: string;
  administeredBy: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  administeredByUser: User;
}

export interface CreatePsychometricEvaluationInput {
  psychologyRecordId: string;
  evaluationType: string;
  applicationDate: string;
  rawScore?: number;
  standardScore?: number;
  percentile?: number;
  interpretation?: string;
  administeredBy: string;
  fileUrl?: string;
}
