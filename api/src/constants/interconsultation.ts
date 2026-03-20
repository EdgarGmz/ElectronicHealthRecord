export const INTERCONSULTATION_STATUS = {
  PENDING: 'Pendiente',
  RESPONDED: 'Respondida',
  CANCELLED: 'Cancelada',
} as const;

export const INTERCONSULTATION_STATUS_VALUES = Object.values(INTERCONSULTATION_STATUS);

export type InterconsultationStatus = typeof INTERCONSULTATION_STATUS[keyof typeof INTERCONSULTATION_STATUS];

export const INTERCONSULTATION_URGENCY = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
} as const;

export const INTERCONSULTATION_URGENCY_VALUES = Object.values(INTERCONSULTATION_URGENCY);

export type InterconsultationUrgency = typeof INTERCONSULTATION_URGENCY[keyof typeof INTERCONSULTATION_URGENCY];

export const DEPARTMENT = {
  PSYCHOLOGY: 'Psicología',
  NURSING: 'Enfermería',
  SOCIAL_WORK: 'Trabajo Social',
  ADMIN: 'Administrativo',
} as const;

export const DEPARTMENT_VALUES = Object.values(DEPARTMENT);

export type Department = typeof DEPARTMENT[keyof typeof DEPARTMENT];
