export interface PsychometricEvaluationUser {
  id: string
  firstName: string
  lastName: string
  email: string
  enrollmentNumber?: string | null
}

export interface PsychometricEvaluationPatient {
  id: string
  user: PsychometricEvaluationUser
}

export interface PsychometricEvaluationPsychologyRecord {
  id: string
  medicalRecord: {
    patient: PsychometricEvaluationPatient
  }
}

export interface PsychometricEvaluation {
  id: string
  psychologyRecordId: string
  evaluationType: string
  applicationDate: string
  rawScore: number | string | null
  standardScore: number | string | null
  percentile: number | null
  interpretation: string | null
  administeredBy: string
  fileUrl: string | null
  createdAt: string
  updatedAt: string
  psychologyRecord?: PsychometricEvaluationPsychologyRecord
  administeredByUser?: {
    id: string
    firstName: string
    lastName: string
    email: string
    role?: string
  }
}

export interface PsychometricEvaluationsResponse {
  evaluations: PsychometricEvaluation[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreatePsychometricEvaluationInput {
  psychologyRecordId: string
  evaluationType: string
  applicationDate: string
  rawScore?: number | string
  standardScore?: number | string
  percentile?: number
  interpretation?: string
  fileUrl?: string
}

export interface UpdatePsychometricEvaluationInput {
  evaluationType?: string
  applicationDate?: string
  rawScore?: number | string
  standardScore?: number | string
  percentile?: number
  interpretation?: string
  fileUrl?: string
}
