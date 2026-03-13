/**
 * Roles del sistema (RBAC).
 * Admin = auditor: usuario único, no se puede borrar. Solo lectura en pacientes, citas, medicamentos; sin expedientes, terapia ni psicometría. Acceso total a interconsultas, notificaciones, reportes, audit logs, usuarios y carreras.
 * PATIENT solo se usa en el User vinculado al expediente (Patient); el paciente no es usuario del sistema.
 */
export const ROLES = {
  ADMIN: 'admin',
  COORDINADOR_PSICOLOGIA: 'coordinador_psicologia',
  COORDINADOR_ENFERMERIA: 'coordinador_enfermeria',
  PSICOLOGO: 'psicologo',
  ENFERMERO: 'enfermero',
  /** Solo para el User asociado al registro Patient; no inicia sesión. */
  PATIENT: 'patient',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles de personal con acceso al sistema (excluye patient) */
export const STAFF_ROLES = [
  ROLES.ADMIN,
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
] as const;

/** Pueden crear/editar pacientes (admin solo puede ver). Enfermero no puede eliminar. */
export const ROLES_CAN_MANAGE_PATIENTS = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
] as const;

/** Pueden eliminar (desactivar) pacientes. Enfermero solo crea/edita, no elimina. */
export const ROLES_CAN_DELETE_PATIENTS = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO] as const;

/** Pueden acceder (ver) expedientes médicos. Coordinador enfermería solo expedientes de pacientes con consultas de enfermería. */
export const ROLES_CAN_ACCESS_MEDICAL_RECORDS = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
] as const;

/** Pueden crear expedientes médicos (coordinador enfermería no crea; solo ve los de pacientes ya registrados en enfermería). */
export const ROLES_CAN_CREATE_MEDICAL_RECORD = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
] as const;

/** Pueden crear/editar/cancelar citas. Coordinador enfermería no genera citas; enfermero solo puede ver sus citas (acceso restringido). */
export const ROLES_CAN_MANAGE_APPOINTMENTS = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO] as const;

/** Roles que pueden ser profesional en citas */
export const ROLES_PROFESSIONAL_APPOINTMENT = [ROLES.PSICOLOGO, ROLES.ENFERMERO] as const;

/** Acceso completo a sesiones de terapia (crear/editar). Coordinador enfermería tiene acceso restringido (solo lectura en servicio). */
export const ROLES_THERAPY_SESSIONS = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO] as const;

/** Pueden ver sesiones de terapia (solo lectura; coordinador enfermería solo de pacientes con consultas de enfermería) */
export const ROLES_THERAPY_SESSIONS_READ = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.PSICOLOGO,
  ROLES.COORDINADOR_ENFERMERIA,
] as const;

/** Pueden consultar y editar stock de medicamentos (enfermero: solo consulta y stock; coordinador enfermería: CRUD completo). */
export const ROLES_CAN_MANAGE_MEDICATIONS = [ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO] as const;

/** Pueden crear nuevos medicamentos en el catálogo (solo coordinador enfermería; enfermero solo edita stock). */
export const ROLES_CAN_CREATE_MEDICATION = [ROLES.COORDINADOR_ENFERMERIA] as const;

/** Roles que pueden crear/editar evaluaciones psicométricas. Coordinador enfermería solo lectura (filtrado en servicio). */
export const ROLES_PSICOMETRIA = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO] as const;

/** Pueden ver evaluaciones psicométricas (solo lectura; coordinador enfermería solo de pacientes con consultas de enfermería) */
export const ROLES_PSICOMETRIA_READ = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.PSICOLOGO,
  ROLES.COORDINADOR_ENFERMERIA,
] as const;

/** Solo coordinador de psicología puede eliminar evaluaciones psicométricas */
export const ROLES_CAN_DELETE_PSICOMETRIA = [ROLES.COORDINADOR_PSICOLOGIA] as const;

/** Pueden ver audit logs: admin (todos), coordinador_psicologia (solo dept. psicología), coordinador_enfermeria (solo dept. enfermería) */
export const ROLES_AUDIT_LOG = [ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA] as const;

/** Pueden crear usuarios del departamento de psicología (coordinador solo con role psicologo) */
export const ROLES_CAN_CREATE_PSYCHOLOGY_USER = [ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA] as const;

/** Pueden crear usuarios del departamento de enfermería (coordinador solo con role enfermero) */
export const ROLES_CAN_CREATE_NURSING_USER = [ROLES.ADMIN, ROLES.COORDINADOR_ENFERMERIA] as const;

/** Roles que pueden crear notificaciones */
export const ROLES_CAN_CREATE_NOTIFICATIONS = [
  ROLES.ADMIN,
  ROLES.ENFERMERO,
  ROLES.PSICOLOGO,
] as const;

/** Roles válidos para interconsultas (todos los de personal, admin con acceso total) */
export const ROLES_INTERCONSULTA = [
  ROLES.ADMIN,
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
] as const;

/** Solo admin tiene CRUD completo de usuarios */
export const ROLES_USER_CRUD = [ROLES.ADMIN] as const;

/** Roles que se listan en el módulo de usuarios (psicólogos, enfermeros y sus coordinadores). Solo ellos tienen acceso al sistema. */
export const ROLES_VISIBLE_IN_USERS = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
] as const;

/** Solo admin tiene CRUD completo de carreras */
export const ROLES_CAREER_CRUD = [ROLES.ADMIN] as const;

/** Pueden ver listado y detalle de procedimientos de enfermería (mismo criterio que expedientes). */
export const ROLES_CAN_ACCESS_NURSING_PROCEDURES = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
] as const;

/** Pueden crear procedimientos de enfermería (en el contexto de una consulta de enfermería). */
export const ROLES_CAN_CREATE_NURSING_PROCEDURE = [ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO] as const;
