/**
 * Roles del sistema (RBAC). Solo personal con acceso al sistema.
 * 5 roles: admin, coordinador_psicologia, coordinador_enfermeria, psicologo, enfermero.
 * El paciente no es usuario del sistema.
 */
export const ROLES = {
  ADMIN: 'admin',
  COORDINADOR_PSICOLOGIA: 'coordinador_psicologia',
  COORDINADOR_ENFERMERIA: 'coordinador_enfermeria',
  PSICOLOGO: 'psicologo',
  ENFERMERO: 'enfermero',
} as const;

export type Role =
  | typeof ROLES.ADMIN
  | typeof ROLES.COORDINADOR_PSICOLOGIA
  | typeof ROLES.COORDINADOR_ENFERMERIA
  | typeof ROLES.PSICOLOGO
  | typeof ROLES.ENFERMERO;

/** Pueden crear/editar pacientes. Enfermero no puede eliminar. */
export const CAN_MANAGE_PATIENTS: Role[] = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
];

/** Pueden eliminar (desactivar) pacientes. Enfermero solo crea/edita. */
export const CAN_DELETE_PATIENTS: Role[] = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO];

/** Pueden crear/editar/cancelar citas. Enfermero solo ve sus citas (acceso restringido). */
export const CAN_MANAGE_APPOINTMENTS: Role[] = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO];

/** Pueden consultar y editar stock de medicamentos */
export const CAN_MANAGE_MEDICATIONS: Role[] = [ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO];

/** Pueden crear nuevos medicamentos en el catálogo (enfermero solo edita stock) */
export const CAN_CREATE_MEDICATION: Role[] = [ROLES.COORDINADOR_ENFERMERIA];

/** Pueden crear/editar sesiones de terapia (coordinador enfermería solo lectura) */
export const CAN_MANAGE_THERAPY_SESSIONS: Role[] = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO];

/** Pueden crear/editar evaluaciones psicométricas (coordinador enfermería solo lectura) */
export const CAN_MANAGE_PSICOMETRIA: Role[] = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO];

/** Pueden crear expedientes médicos (coordinador enfermería no crea) */
export const CAN_CREATE_MEDICAL_RECORD: Role[] = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
];
