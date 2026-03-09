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
  '/patients': [],
  '/appointments': [],
  '/sessions': [ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.PSICOLOGO],
  '/medications': [],
  '/procedures': [],
  '/interconsultations': [],
  '/reports': [],
  '/evaluations': [],
  '/notifications': [],
  '/audit-logs': [ROLES.ADMIN],
}

/** Paths that require medical record access (expediente). Same roles as API ROLES_CAN_ACCESS_MEDICAL_RECORDS. */
const EXPEDIENT_PATH_PREFIX = '/patients/'
const EXPEDIENT_ALLOWED_ROLES: readonly string[] = [
  ROLES.COORDINADOR_PSICOLOGIA,
  ROLES.COORDINADOR_ENFERMERIA,
  ROLES.PSICOLOGO,
  ROLES.ENFERMERO,
]

/**
 * Returns whether the given role can see the nav item with path `to`.
 * If the path is not in NAV_VISIBILITY or the array is empty, all roles can see it.
 * Otherwise only the listed roles can see it (admin is excluded for sessions).
 */
export function canSeeNavItem(to: string, role: string | undefined): boolean {
  const r = normalizeRole(role)
  const allowed = NAV_VISIBILITY[to]
  if (!allowed || allowed.length === 0) return true
  return allowed.includes(r)
}

/**
 * Returns whether the given role can access the given pathname (e.g. /sessions, /sessions/new, /sessions/123).
 * Used to show UnauthorizedPage when user navigates directly to a restricted route.
 */
/**
 * Returns whether the given role can access patient expedient (medical record) pages.
 */
export function canAccessExpedient(role: string | undefined): boolean {
  const r = normalizeRole(role)
  return r ? EXPEDIENT_ALLOWED_ROLES.includes(r) : false
}

export function canAccessPath(pathname: string, role: string | undefined): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized.startsWith(EXPEDIENT_PATH_PREFIX) && normalized.includes('/expedient')) {
    return canAccessExpedient(role)
  }
  for (const key of Object.keys(NAV_VISIBILITY)) {
    if (normalized === key || normalized.startsWith(key + '/')) return canSeeNavItem(key, role)
  }
  return true
}
