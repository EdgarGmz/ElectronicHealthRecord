export interface InterconsultationUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

export interface InterconsultationPatient {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    enrollmentNumber?: string | null
  }
}

export interface Interconsultation {
  id: string
  patientId: string
  fromDepartment: string
  toDepartment: string
  fromProfessionalId: string
  toProfessionalId: string | null
  reason: string
  relevantInformation: string | null
  urgency: string
  status: string
  response: string | null
  respondedBy: string | null
  respondedAt: string | null
  createdAt: string
  updatedAt: string
  patient?: InterconsultationPatient
  fromProfessional?: InterconsultationUser
  toProfessional?: InterconsultationUser | null
  respondedByUser?: InterconsultationUser | null
}

export interface InterconsultationsResponse {
  interconsultations: Interconsultation[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateInterconsultationInput {
  patientId: string
  fromDepartment: string
  toDepartment: string
  toProfessionalId?: string
  reason: string
  relevantInformation?: string
  urgency: string
}

/** API department values (must match backend DEPARTMENT_VALUES) */
export const DEPARTMENT_VALUES = ['Psicología', 'Enfermería', 'Trabajo Social', 'Administrativo'] as const

/** API status values */
export const STATUS_VALUES = ['Pendiente', 'Respondida', 'Cancelada'] as const

/** API urgency values */
export const URGENCY_VALUES = ['Baja', 'Media', 'Alta', 'Urgente'] as const
