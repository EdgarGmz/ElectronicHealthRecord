/**
 * Role strings aligned with API (api/src/constants/roles.ts).
 * Used for dashboard visibility and nav filtering.
 */
export const ROLES = {
  ADMIN: 'admin',
  COORDINADOR_PSICOLOGIA: 'coordinador_psicologia',
  COORDINADOR_ENFERMERIA: 'coordinador_enfermeria',
  PSICOLOGO: 'psicologo',
  ENFERMERO: 'enfermero',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Roles que se listan en el módulo de usuarios (psicólogos, enfermeros y sus coordinadores). Solo ellos tienen acceso al sistema. */
export const ROLES_VISIBLE_IN_USERS: readonly string[] = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
]

/** Coordinadores y psicólogos pueden registrar pacientes nuevos. */
export const ROLES_CAN_CREATE_PATIENT: readonly string[] = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
]

/** Solo coordinadores pueden eliminar (desactivar) pacientes. */
export const ROLES_CAN_DELETE_PATIENTS: readonly string[] = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
]

/** Pueden editar pacientes (coordinadores + psicólogo + enfermero). */
export const ROLES_CAN_EDIT_PATIENT: readonly string[] = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
]

/** Medicamentos: CRUD completo solo coordinador de enfermería. */
export const ROLES_CAN_CREATE_MEDICATION: readonly string[] = [ROLES.COORDINADOR_ENFERMERIA]
export const ROLES_CAN_MANAGE_MEDICATIONS: readonly string[] = [ROLES.COORDINADOR_ENFERMERIA]

/** Pueden crear citas nuevas. Coord. psicología solo ve la lista. */
export const ROLES_CAN_CREATE_APPOINTMENT: readonly string[] = [ROLES.PSICOLOGO]

/** Roles that see "Total pacientes" on dashboard (coordinators + admin) */
const ROLES_TOTAL_PATIENTS: readonly string[] = [
  ROLES.ADMIN,
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
]

/** Roles that see "Citas hoy" (all staff with appointment context) */
const ROLES_APPOINTMENTS_TODAY: readonly string[] = [
  ROLES.ADMIN,
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
]

/** Roles that see "Pendientes" (tasks/pending items) */
const ROLES_PENDING: readonly string[] = [
  ROLES.ADMIN,
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
]

export type DashboardCardId = 'totalPatients' | 'appointmentsToday' | 'pending'

export interface DashboardCardConfig {
  id: DashboardCardId
  /** Which roles can see this card */
  roles: readonly string[]
}

export const DASHBOARD_CARDS: DashboardCardConfig[] = [
  { id: 'totalPatients', roles: ROLES_TOTAL_PATIENTS },
  { id: 'appointmentsToday', roles: ROLES_APPOINTMENTS_TODAY },
  { id: 'pending', roles: ROLES_PENDING },
]

function normalizeRole(role: string | undefined): string {
  return role?.toLowerCase().trim() ?? ''
}

/**
 * Returns the list of dashboard card ids the given role is allowed to see.
 */
export function getVisibleDashboardCards(role: string | undefined): DashboardCardId[] {
  const r = normalizeRole(role)
  return r ? DASHBOARD_CARDS.filter((c) => c.roles.includes(r)).map((c) => c.id) : []
}

/** Nav path -> roles that can see it (empty = all staff). Sesiones solo psicología/coords, no admin. Audit logs solo admin. */
const NAV_VISIBILITY: Record<string, readonly string[]> = {
  '/': [], // dashboard: all
  /** Módulo Calendario independiente: solo psicólogo (su semana). Coordinador usa /supervision/calendar */
  '/calendar': [ROLES.PSICOLOGO],
  /** Módulo Supervisión y Gestión de Personal: solo coordinador psicología */
  '/supervision': [ROLES.COORDINADOR_PSICOLOGIA],
  // Admin is an auditor; hide operational modules from admin UI
  '/patients': [ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.PSICOLOGO, ROLES.ENFERMERO],
  /** Coordinadores y enfermero no tienen acceso al módulo Citas; solo psicólogo operativo */
  '/appointments': [ROLES.PSICOLOGO],
  /** Sesiones de terapia: solo psicólogo (exclusivo de psicología) */
  '/sessions': [ROLES.PSICOLOGO],
  '/medications': [ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO],
  // Procedimientos y Atención Rápida: exclusivo de enfermería operativa (solo enfermero)
  '/procedures': [ROLES.ENFERMERO],
  '/nursing-attention': [ROLES.ENFERMERO],
  '/interconsultations': [],
  '/reports': [],
  /** Evaluaciones psicométricas: solo psicólogo. */
  '/evaluations': [ROLES.PSICOLOGO],
  '/notifications': [],
  '/users': [ROLES.ADMIN],
  '/audit-logs': [ROLES.ADMIN],
  '/careers': [ROLES.ADMIN],
}

/**
 * Expediente PSICOLÓGICO — datos sensibles exclusivos del área de psicología.
 * Solo psicólogo y coordinador de psicología pueden acceder.
 * El admin, enfermero y coordinador de enfermería quedan excluidos.
 */
const EXPEDIENT_PSY_ROLES: readonly string[] = [
  ROLES.PSICOLOGO,
  ROLES.COORDINADOR_PSICOLOGIA,
]

/**
 * Expediente MÉDICO (enfermería) — datos clínicos del área de enfermería.
 * Solo enfermero y coordinador de enfermería pueden acceder.
 */
const EXPEDIENT_MED_ROLES: readonly string[] = [
  ROLES.ENFERMERO,
  ROLES.COORDINADOR_ENFERMERIA,
]

const EXPEDIENT_PATH_PREFIX = '/patients/'

/**
 * ¿El rol puede ver el expediente PSICOLÓGICO de un paciente?
 * Usar en PatientDetailPage para la pestaña de psicología y en el click de fila.
 */
export function canAccessExpedient(role: string | undefined): boolean {
  const r = normalizeRole(role)
  return r ? EXPEDIENT_PSY_ROLES.includes(r) : false
}

/**
 * ¿El rol puede ver el expediente MÉDICO (enfermería) de un paciente?
 * Usar en PatientDetailPage para la pestaña médica.
 */
export function canAccessMedicalRecord(role: string | undefined): boolean {
  const r = normalizeRole(role)
  return r ? EXPEDIENT_MED_ROLES.includes(r) : false
}

/**
 * ¿El rol puede acceder a ALGÚN tipo de expediente (psicológico O médico)?
 * Controla la visibilidad del botón de expediente en la lista y la ruta /expedient.
 */
export function canAccessAnyExpedient(role: string | undefined): boolean {
  return canAccessExpedient(role) || canAccessMedicalRecord(role)
}

/**
 * Returns whether the given role can see the nav item with path `to`.
 * If the path is not in NAV_VISIBILITY or the array is empty, all roles can see it.
 * Otherwise only the listed roles can see it.
 */
export function canSeeNavItem(to: string, role: string | undefined): boolean {
  const r = normalizeRole(role)
  const allowed = NAV_VISIBILITY[to]
  if (!allowed || allowed.length === 0) return true
  return allowed.includes(r)
}

export function canAccessPath(pathname: string, role: string | undefined): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized.startsWith(EXPEDIENT_PATH_PREFIX) && normalized.includes('/expedient')) {
    return canAccessAnyExpedient(role)
  }
  // Solo coordinadores acceden a /patients/new
  if (normalized === '/patients/new') {
    const r = normalizeRole(role)
    return r ? ROLES_CAN_CREATE_PATIENT.includes(r) : false
  }
  // Editar paciente: coordinadores, psicólogo y enfermero
  if (normalized.match(/^\/patients\/[^/]+\/edit$/)) {
    const r = normalizeRole(role)
    return r ? ROLES_CAN_EDIT_PATIENT.includes(r) : false
  }
  // Solo roles que pueden crear citas acceden a /appointments/new; list y detalle los ve quien tenga nav
  if (normalized === '/appointments/new') {
    const r = normalizeRole(role)
    return r ? ROLES_CAN_CREATE_APPOINTMENT.includes(r) : false
  }
  if (normalized === '/appointments' || (normalized.startsWith('/appointments/') && normalized !== '/appointments/new')) {
    return canSeeNavItem('/appointments', role)
  }
  for (const key of Object.keys(NAV_VISIBILITY)) {
    if (normalized === key || normalized.startsWith(key + '/')) return canSeeNavItem(key, role)
  }
  return true
}
