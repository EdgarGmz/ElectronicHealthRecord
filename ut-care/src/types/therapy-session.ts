export interface TherapySessionPatientUser {
  id: string
  firstName: string
  lastName: string
  email: string
  enrollmentNumber?: string | null
}

export interface TherapySessionPatient {
  id: string
  user: TherapySessionPatientUser
}

export interface TherapySessionTherapist {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface TherapySession {
  id: string
  psychologyRecordId: string
  sessionNumber: number
  sessionDate: string
  sessionDuration: number
  mood: string
  evolutionNotes: string | null
  patientProgress: string | null
  assignedTasks: string | null
  observations: string | null
  nextSessionPlan: string | null
  therapistId: string
  createdAt: string
  updatedAt: string
  psychologyRecord: {
    id: string
    medicalRecord: { patient: TherapySessionPatient }
  }
  therapist: TherapySessionTherapist
}

export interface TherapySessionsResponse {
  sessions: TherapySession[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}
