export interface AppointmentPatientUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  enrollmentNumber?: string | null
}

export interface AppointmentPatient {
  id: string
  user: AppointmentPatientUser
}

export interface AppointmentProfessional {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface AppointmentCreatedBy {
  id: string
  firstName: string
  lastName: string
}

export interface Appointment {
  id: string
  patientId: string
  professionalId: string
  appointmentType: string
  department: string
  scheduledDate: string
  durationMinutes: number
  status: string
  cancellationReason: string | null
  rescheduleReason?: string | null
  notes: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  patient: AppointmentPatient
  professional: AppointmentProfessional
  createdByUser: AppointmentCreatedBy
}

export interface AppointmentsResponse {
  appointments: Appointment[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const

export const DEPARTMENT_KEYS: Record<string, string> = {
  psychology: 'departmentPsychology',
  nursing: 'departmentNursing',
}
