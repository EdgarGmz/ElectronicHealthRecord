export const NOTIFICATION_TYPES = {
  // Appointment notifications
  APPOINTMENT_CREATED: 'appointment_created',
  APPOINTMENT_UPDATED: 'appointment_updated',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_COMPLETED: 'appointment_completed',

  // Prescription notifications
  PRESCRIPTION_CREATED: 'prescription_created',
  PRESCRIPTION_STATUS_CHANGED: 'prescription_status_changed',
  MEDICATION_ADMINISTERED: 'medication_administered',

  // Interconsultation notifications
  INTERCONSULTATION_REQUESTED: 'interconsultation_requested',
  INTERCONSULTATION_RESPONDED: 'interconsultation_responded',
  INTERCONSULTATION_STATUS_CHANGED: 'interconsultation_status_changed',

  // Medical record notifications
  MEDICAL_RECORD_UPDATED: 'medical_record_updated',
  THERAPY_SESSION_SCHEDULED: 'therapy_session_scheduled',
  THERAPY_SESSION_COMPLETED: 'therapy_session_completed',
  PSYCHOMETRIC_EVALUATION_COMPLETED: 'psychometric_evaluation_completed',
  TREATMENT_PLAN_CREATED: 'treatment_plan_created',
  TREATMENT_PLAN_UPDATED: 'treatment_plan_updated',

  // System notifications
  SYSTEM_ALERT: 'system_alert',
  SYSTEM_MAINTENANCE: 'system_maintenance',
} as const;

export const NOTIFICATION_PRIORITIES = {
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const NOTIFICATION_PRIORITY_VALUES = Object.values(NOTIFICATION_PRIORITIES);
export const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPES);

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[keyof typeof NOTIFICATION_PRIORITIES];
