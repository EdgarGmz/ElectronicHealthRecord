/**
 * Tests unitarios para src/constants/roles.ts
 *
 * Cubre las funciones puras de control de acceso basado en roles (RBAC):
 *   - canSeeNavItem(to, role)
 *   - canAccessPath(pathname, role)
 *   - canAccessExpedient(role)
 *   - getVisibleDashboardCards(role)
 *
 * No requiere DOM ni mocks de React — son funciones puras de TypeScript.
 */
import { describe, it, expect } from 'vitest'
import {
  canSeeNavItem,
  canAccessPath,
  canAccessExpedient,
  getVisibleDashboardCards,
  ROLES,
} from '@/constants/roles'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const ALL_ROLES = Object.values(ROLES)


// ─────────────────────────────────────────────────────────────────────────────
// canSeeNavItem
// ─────────────────────────────────────────────────────────────────────────────
describe('canSeeNavItem', () => {
  describe('rutas abiertas a todo el staff (array vacío en NAV_VISIBILITY)', () => {
    const openPaths = ['/', '/interconsultations', '/reports', '/notifications']

    it.each(openPaths)('todos los roles pueden ver %s', (path) => {
      ALL_ROLES.forEach((role) => {
        expect(canSeeNavItem(path, role)).toBe(true)
      })
    })

    it('undefined role puede ver rutas abiertas', () => {
      openPaths.forEach((path) => {
        expect(canSeeNavItem(path, undefined)).toBe(true)
      })
    })
  })

  describe('/calendar — solo psicólogo', () => {
    it('psicólogo puede ver /calendar', () => {
      expect(canSeeNavItem('/calendar', ROLES.PSICOLOGO)).toBe(true)
    })

    it.each([
      ROLES.ADMIN,
      ROLES.COORDINADOR_PSICOLOGIA,
      ROLES.COORDINADOR_ENFERMERIA,
      ROLES.ENFERMERO,
    ])('rol %s NO puede ver /calendar', (role) => {
      expect(canSeeNavItem('/calendar', role)).toBe(false)
    })
  })

  describe('/supervision — solo coordinador de psicología', () => {
    it('coordinador de psicología puede ver /supervision', () => {
      expect(canSeeNavItem('/supervision', ROLES.COORDINADOR_PSICOLOGIA)).toBe(true)
    })

    it.each([
      ROLES.ADMIN,
      ROLES.PSICOLOGO,
      ROLES.COORDINADOR_ENFERMERIA,
      ROLES.ENFERMERO,
    ])('rol %s NO puede ver /supervision', (role) => {
      expect(canSeeNavItem('/supervision', role)).toBe(false)
    })
  })

  describe('/appointments — solo psicólogo', () => {
    it('psicólogo puede ver /appointments', () => {
      expect(canSeeNavItem('/appointments', ROLES.PSICOLOGO)).toBe(true)
    })

    it.each([ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO])(
      'rol %s NO puede ver /appointments',
      (role) => {
        expect(canSeeNavItem('/appointments', role)).toBe(false)
      },
    )
  })

  describe('/sessions — solo psicólogo', () => {
    it('psicólogo puede ver /sessions', () => {
      expect(canSeeNavItem('/sessions', ROLES.PSICOLOGO)).toBe(true)
    })

    it.each([ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO])(
      'rol %s NO puede ver /sessions',
      (role) => {
        expect(canSeeNavItem('/sessions', role)).toBe(false)
      },
    )
  })

  describe('/medications — coordinador de enfermería y enfermero', () => {
    it.each([ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO])(
      'rol %s puede ver /medications',
      (role) => {
        expect(canSeeNavItem('/medications', role)).toBe(true)
      },
    )

    it.each([ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO])(
      'rol %s NO puede ver /medications',
      (role) => {
        expect(canSeeNavItem('/medications', role)).toBe(false)
      },
    )
  })

  describe('/procedures y /nursing-attention — solo enfermero', () => {
    it.each(['/procedures', '/nursing-attention'])('%s solo visible para enfermero', (path) => {
      expect(canSeeNavItem(path, ROLES.ENFERMERO)).toBe(true)

      ;[ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.PSICOLOGO].forEach(
        (role) => {
          expect(canSeeNavItem(path, role)).toBe(false)
        },
      )
    })
  })

  describe('/users, /audit-logs, /careers — solo admin', () => {
    it.each(['/users', '/audit-logs', '/careers'])('%s solo visible para admin', (path) => {
      expect(canSeeNavItem(path, ROLES.ADMIN)).toBe(true)

      ;[
        ROLES.COORDINADOR_PSICOLOGIA,
        ROLES.COORDINADOR_ENFERMERIA,
        ROLES.PSICOLOGO,
        ROLES.ENFERMERO,
      ].forEach((role) => {
        expect(canSeeNavItem(path, role)).toBe(false)
      })
    })
  })

  describe('/evaluations — solo psicólogo', () => {
    it('psicólogo puede ver /evaluations', () => {
      expect(canSeeNavItem('/evaluations', ROLES.PSICOLOGO)).toBe(true)
    })

    it.each([ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO])(
      'rol %s NO puede ver /evaluations',
      (role) => {
        expect(canSeeNavItem('/evaluations', role)).toBe(false)
      },
    )
  })

  describe('/patients — excluye al admin (solo ve datos de auditoría)', () => {
    it.each([
      ROLES.COORDINADOR_PSICOLOGIA,
      ROLES.COORDINADOR_ENFERMERIA,
      ROLES.PSICOLOGO,
      ROLES.ENFERMERO,
    ])('rol %s puede ver /patients', (role) => {
      expect(canSeeNavItem('/patients', role)).toBe(true)
    })

    it('admin NO puede ver /patients (solo es auditor)', () => {
      expect(canSeeNavItem('/patients', ROLES.ADMIN)).toBe(false)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// canAccessExpedient
// ─────────────────────────────────────────────────────────────────────────────
describe('canAccessExpedient', () => {
  it.each([ROLES.PSICOLOGO, ROLES.ENFERMERO])(
    'rol %s puede acceder al expediente médico',
    (role) => {
      expect(canAccessExpedient(role)).toBe(true)
    },
  )

  it.each([ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA])(
    'rol %s NO puede acceder al expediente médico',
    (role) => {
      expect(canAccessExpedient(role)).toBe(false)
    },
  )

  it('undefined role retorna false', () => {
    expect(canAccessExpedient(undefined)).toBe(false)
  })

  it('string vacío retorna false', () => {
    expect(canAccessExpedient('')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// canAccessPath — rutas de pacientes
// ─────────────────────────────────────────────────────────────────────────────
describe('canAccessPath — /patients', () => {
  describe('/patients/new — solo coordinadores y psicólogo', () => {
    it.each([ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.PSICOLOGO])(
      'rol %s puede crear paciente',
      (role) => {
        expect(canAccessPath('/patients/new', role)).toBe(true)
      },
    )

    it.each([ROLES.ADMIN, ROLES.ENFERMERO])('rol %s NO puede crear paciente', (role) => {
      expect(canAccessPath('/patients/new', role)).toBe(false)
    })
  })

  describe('/patients/:id/edit — coordinadores + psicólogo + enfermero', () => {
    it.each([
      ROLES.COORDINADOR_PSICOLOGIA,
      ROLES.COORDINADOR_ENFERMERIA,
      ROLES.PSICOLOGO,
      ROLES.ENFERMERO,
    ])('rol %s puede editar paciente', (role) => {
      expect(canAccessPath('/patients/abc123/edit', role)).toBe(true)
    })

    it('admin NO puede editar paciente', () => {
      expect(canAccessPath('/patients/abc123/edit', ROLES.ADMIN)).toBe(false)
    })
  })

  describe('/patients/:id/expedient — solo psicólogo y enfermero', () => {
    it.each([ROLES.PSICOLOGO, ROLES.ENFERMERO])('rol %s puede ver expediente', (role) => {
      expect(canAccessPath('/patients/abc123/expedient', role)).toBe(true)
    })

    it.each([ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA])(
      'rol %s NO puede ver expediente',
      (role) => {
        expect(canAccessPath('/patients/abc123/expedient', role)).toBe(false)
      },
    )
  })

  describe('/patients/:id — detalle (acceso via canSeeNavItem)', () => {
    it.each([
      ROLES.COORDINADOR_PSICOLOGIA,
      ROLES.COORDINADOR_ENFERMERIA,
      ROLES.PSICOLOGO,
      ROLES.ENFERMERO,
    ])('rol %s puede ver detalle de paciente', (role) => {
      expect(canAccessPath('/patients/abc123', role)).toBe(true)
    })

    it('admin NO puede ver detalle de paciente', () => {
      expect(canAccessPath('/patients/abc123', ROLES.ADMIN)).toBe(false)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// canAccessPath — rutas de citas
// ─────────────────────────────────────────────────────────────────────────────
describe('canAccessPath — /appointments', () => {
  it('solo psicólogo puede acceder a /appointments/new', () => {
    expect(canAccessPath('/appointments/new', ROLES.PSICOLOGO)).toBe(true)
    ;[ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO].forEach(
      (role) => {
        expect(canAccessPath('/appointments/new', role)).toBe(false)
      },
    )
  })

  it('solo psicólogo puede acceder a /appointments (lista)', () => {
    expect(canAccessPath('/appointments', ROLES.PSICOLOGO)).toBe(true)
    ;[ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO].forEach(
      (role) => {
        expect(canAccessPath('/appointments', role)).toBe(false)
      },
    )
  })

  it('solo psicólogo puede acceder a /appointments/:id (detalle)', () => {
    expect(canAccessPath('/appointments/xyz', ROLES.PSICOLOGO)).toBe(true)
    expect(canAccessPath('/appointments/xyz', ROLES.ENFERMERO)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// canAccessPath — rutas de sesiones, evaluaciones, supervisión
// ─────────────────────────────────────────────────────────────────────────────
describe('canAccessPath — módulos de psicología', () => {
  it.each(['/sessions', '/sessions/new', '/sessions/abc'])(
    'solo psicólogo puede acceder a %s',
    (path) => {
      expect(canAccessPath(path, ROLES.PSICOLOGO)).toBe(true)
      ;[ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO].forEach(
        (role) => {
          expect(canAccessPath(path, role)).toBe(false)
        },
      )
    },
  )

  it.each(['/evaluations', '/evaluations/new', '/evaluations/abc'])(
    'solo psicólogo puede acceder a %s',
    (path) => {
      expect(canAccessPath(path, ROLES.PSICOLOGO)).toBe(true)
      expect(canAccessPath(path, ROLES.ENFERMERO)).toBe(false)
    },
  )

  it.each(['/supervision', '/supervision/psychologists', '/supervision/calendar'])(
    'solo coordinador de psicología puede acceder a %s',
    (path) => {
      expect(canAccessPath(path, ROLES.COORDINADOR_PSICOLOGIA)).toBe(true)
      ;[ROLES.ADMIN, ROLES.PSICOLOGO, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO].forEach((role) => {
        expect(canAccessPath(path, role)).toBe(false)
      })
    },
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// canAccessPath — rutas de enfermería
// ─────────────────────────────────────────────────────────────────────────────
describe('canAccessPath — módulos de enfermería', () => {
  it.each(['/medications', '/medications/new', '/medications/abc/edit'])(
    'coordinador de enfermería y enfermero pueden acceder a %s',
    (path) => {
      expect(canAccessPath(path, ROLES.COORDINADOR_ENFERMERIA)).toBe(true)
      expect(canAccessPath(path, ROLES.ENFERMERO)).toBe(true)
      expect(canAccessPath(path, ROLES.PSICOLOGO)).toBe(false)
    },
  )

  it.each(['/procedures', '/procedures/new', '/nursing-attention'])(
    'solo enfermero puede acceder a %s',
    (path) => {
      expect(canAccessPath(path, ROLES.ENFERMERO)).toBe(true)
      ;[ROLES.ADMIN, ROLES.COORDINADOR_PSICOLOGIA, ROLES.COORDINADOR_ENFERMERIA, ROLES.PSICOLOGO].forEach(
        (role) => {
          expect(canAccessPath(path, role)).toBe(false)
        },
      )
    },
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// canAccessPath — rutas de admin
// ─────────────────────────────────────────────────────────────────────────────
describe('canAccessPath — rutas de admin', () => {
  it.each(['/users', '/audit-logs', '/careers'])('solo admin puede acceder a %s', (path) => {
    expect(canAccessPath(path, ROLES.ADMIN)).toBe(true)
    ;[
      ROLES.COORDINADOR_PSICOLOGIA,
      ROLES.COORDINADOR_ENFERMERIA,
      ROLES.PSICOLOGO,
      ROLES.ENFERMERO,
    ].forEach((role) => {
      expect(canAccessPath(path, role)).toBe(false)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// canAccessPath — rutas abiertas a todo el staff autenticado
// ─────────────────────────────────────────────────────────────────────────────
describe('canAccessPath — rutas abiertas a todo el staff', () => {
  const openPaths = [
    '/',
    '/interconsultations',
    '/interconsultations/new',
    '/interconsultations/abc',
    '/reports',
    '/notifications',
    '/notifications/new',
  ]

  it.each(openPaths)('todos los roles pueden acceder a %s', (path) => {
    ALL_ROLES.forEach((role) => {
      expect(canAccessPath(path, role)).toBe(true)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// canAccessPath — edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe('canAccessPath — edge cases', () => {
  it('trailing slash en ruta raíz se normaliza correctamente', () => {
    ALL_ROLES.forEach((role) => {
      expect(canAccessPath('/', role)).toBe(true)
    })
  })

  it('undefined role retorna false para ruta restringida', () => {
    expect(canAccessPath('/sessions', undefined)).toBe(false)
    expect(canAccessPath('/audit-logs', undefined)).toBe(false)
  })

  it('undefined role retorna true para rutas abiertas', () => {
    // Las rutas con array vacío permiten cualquier rol (incluido undefined)
    expect(canAccessPath('/reports', undefined)).toBe(true)
    expect(canAccessPath('/notifications', undefined)).toBe(true)
  })

  it('ID de paciente con UUID real en ruta /edit', () => {
    const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    expect(canAccessPath(`/patients/${uuid}/edit`, ROLES.PSICOLOGO)).toBe(true)
    expect(canAccessPath(`/patients/${uuid}/edit`, ROLES.ADMIN)).toBe(false)
  })

  it('ruta anidada desconocida retorna true (comportamiento permisivo para rutas no registradas)', () => {
    // Una ruta que no está en NAV_VISIBILITY ni tiene lógica especial
    expect(canAccessPath('/unknown-route', ROLES.PSICOLOGO)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getVisibleDashboardCards
// ─────────────────────────────────────────────────────────────────────────────
describe('getVisibleDashboardCards', () => {
  it('admin ve las 3 tarjetas (totalPatients, appointmentsToday, pending)', () => {
    const cards = getVisibleDashboardCards(ROLES.ADMIN)
    expect(cards).toContain('totalPatients')
    expect(cards).toContain('appointmentsToday')
    expect(cards).toContain('pending')
    expect(cards).toHaveLength(3)
  })

  it('coordinador de psicología ve las 3 tarjetas', () => {
    const cards = getVisibleDashboardCards(ROLES.COORDINADOR_PSICOLOGIA)
    expect(cards).toHaveLength(3)
  })

  it('coordinador de enfermería ve las 3 tarjetas', () => {
    const cards = getVisibleDashboardCards(ROLES.COORDINADOR_ENFERMERIA)
    expect(cards).toHaveLength(3)
  })

  it('psicólogo ve appointmentsToday y pending (NO totalPatients)', () => {
    const cards = getVisibleDashboardCards(ROLES.PSICOLOGO)
    expect(cards).not.toContain('totalPatients')
    expect(cards).toContain('appointmentsToday')
    expect(cards).toContain('pending')
  })

  it('enfermero ve appointmentsToday y pending (NO totalPatients)', () => {
    const cards = getVisibleDashboardCards(ROLES.ENFERMERO)
    expect(cards).not.toContain('totalPatients')
    expect(cards).toContain('appointmentsToday')
    expect(cards).toContain('pending')
  })

  it('undefined role retorna array vacío', () => {
    expect(getVisibleDashboardCards(undefined)).toEqual([])
  })

  it('string vacío retorna array vacío', () => {
    expect(getVisibleDashboardCards('')).toEqual([])
  })

  it('rol desconocido retorna array vacío', () => {
    expect(getVisibleDashboardCards('rol_inventado')).toEqual([])
  })

  it('normaliza roles con mayúsculas (case-insensitive)', () => {
    // La función normaliza a lowercase, por lo que 'ADMIN' debe funcionar igual que 'admin'
    const cards = getVisibleDashboardCards('ADMIN')
    expect(cards).toHaveLength(3)
  })
})
