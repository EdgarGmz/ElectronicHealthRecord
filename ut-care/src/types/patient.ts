export interface PatientUser {
  id: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phone: string | null
  enrollmentNumber: string | null
}

export interface Career {
  id: string
  name: string
  code: string | null
}

export interface Patient {
  id: string
  userId: string
  patientType: string
  maritalStatus: string | null
  guardianName: string | null
  guardianPhone: string | null
  careerId: string | null
  group: string | null
  occupation: string | null
  trimester: number | null
  createdAt: string
  updatedAt: string
  user: PatientUser
  career: Career | null
}

export interface PatientsResponse {
  patients: Patient[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}
