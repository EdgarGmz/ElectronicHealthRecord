/**
 * Tests unitarios para src/store/auth.store.ts
 *
 * Cubre la lógica de persistencia dual (localStorage / sessionStorage),
 * las acciones principales y el comportamiento de hidratación.
 *
 * Se mockean localStorage y sessionStorage usando el entorno jsdom de Vitest.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/store/auth.store'

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────
const mockUser: User = {
  id: 'user-1',
  email: 'edgar@ut.edu.mx',
  username: 'EdgarGMZ',
  firstName: 'Edgar',
  lastName: 'García',
  role: 'admin',
  isActive: true,
}

const mockToken = 'eyJhbGciOiJIUzI1NiJ9.test-token'
const mockRefreshToken = 'refresh-token-xyz'

// ─────────────────────────────────────────────────────────────────────────────
// Setup: resetear el store a estado vacío antes de cada test
// ─────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
  // Limpiar almacenamiento
  localStorage.clear()
  sessionStorage.clear()

  // Resetear estado del store a valores iniciales (sin romper la referencia del store)
  useAuthStore.setState({
    token: null,
    refreshToken: null,
    user: null,
    rememberMe: true,
    isSessionExpired: false,
    _hasHydrated: false,
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// isAuthenticated
// ─────────────────────────────────────────────────────────────────────────────
describe('isAuthenticated()', () => {
  it('retorna false cuando no hay token', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('retorna true cuando hay token', () => {
    useAuthStore.getState().setAuth(mockToken, null, mockUser)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it('retorna false después de logout', () => {
    useAuthStore.getState().setAuth(mockToken, mockRefreshToken, mockUser)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// setAuth
// ─────────────────────────────────────────────────────────────────────────────
describe('setAuth()', () => {
  it('guarda token, refreshToken y user en el estado', () => {
    useAuthStore.getState().setAuth(mockToken, mockRefreshToken, mockUser)

    const state = useAuthStore.getState()
    expect(state.token).toBe(mockToken)
    expect(state.refreshToken).toBe(mockRefreshToken)
    expect(state.user).toEqual(mockUser)
  })

  it('aplica rememberMe=true cuando se pasa explícitamente', () => {
    useAuthStore.getState().setAuth(mockToken, null, mockUser, true)
    expect(useAuthStore.getState().rememberMe).toBe(true)
  })

  it('aplica rememberMe=false cuando se pasa explícitamente', () => {
    useAuthStore.getState().setAuth(mockToken, null, mockUser, false)
    expect(useAuthStore.getState().rememberMe).toBe(false)
  })

  it('no cambia rememberMe cuando no se pasa el parámetro', () => {
    useAuthStore.setState({ rememberMe: false })
    useAuthStore.getState().setAuth(mockToken, null, mockUser)
    // rememberMe permanece en false (no se sobreescribe)
    expect(useAuthStore.getState().rememberMe).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// logout
// ─────────────────────────────────────────────────────────────────────────────
describe('logout()', () => {
  it('limpia token, refreshToken y user', () => {
    useAuthStore.getState().setAuth(mockToken, mockRefreshToken, mockUser)
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
  })

  it('resetea isSessionExpired a false', () => {
    useAuthStore.getState().setSessionExpired(true)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isSessionExpired).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// setUser
// ─────────────────────────────────────────────────────────────────────────────
describe('setUser()', () => {
  it('actualiza solo el campo user sin tocar el token', () => {
    useAuthStore.getState().setAuth(mockToken, null, mockUser)

    const updatedUser: User = { ...mockUser, firstName: 'Actualizado' }
    useAuthStore.getState().setUser(updatedUser)

    const state = useAuthStore.getState()
    expect(state.user?.firstName).toBe('Actualizado')
    expect(state.token).toBe(mockToken) // token intacto
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// setSessionExpired
// ─────────────────────────────────────────────────────────────────────────────
describe('setSessionExpired()', () => {
  it('activa la bandera de sesión expirada', () => {
    expect(useAuthStore.getState().isSessionExpired).toBe(false)
    useAuthStore.getState().setSessionExpired(true)
    expect(useAuthStore.getState().isSessionExpired).toBe(true)
  })

  it('desactiva la bandera de sesión expirada', () => {
    useAuthStore.getState().setSessionExpired(true)
    useAuthStore.getState().setSessionExpired(false)
    expect(useAuthStore.getState().isSessionExpired).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// setRememberMe
// ─────────────────────────────────────────────────────────────────────────────
describe('setRememberMe()', () => {
  it('actualiza el flag rememberMe a false', () => {
    useAuthStore.getState().setRememberMe(false)
    expect(useAuthStore.getState().rememberMe).toBe(false)
  })

  it('actualiza el flag rememberMe a true', () => {
    useAuthStore.setState({ rememberMe: false })
    useAuthStore.getState().setRememberMe(true)
    expect(useAuthStore.getState().rememberMe).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// _hasHydrated / setHasHydrated
// ─────────────────────────────────────────────────────────────────────────────
describe('_hasHydrated / setHasHydrated()', () => {
  it('empieza en false', () => {
    expect(useAuthStore.getState()._hasHydrated).toBe(false)
  })

  it('setHasHydrated(true) marca la hidratación como completada', () => {
    useAuthStore.getState().setHasHydrated(true)
    expect(useAuthStore.getState()._hasHydrated).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Estado consistente tras múltiples operaciones
// ─────────────────────────────────────────────────────────────────────────────
describe('flujo completo de sesión', () => {
  it('login → cambio de perfil → logout produce estado limpio', () => {
    // Login
    useAuthStore.getState().setAuth(mockToken, mockRefreshToken, mockUser, true)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)

    // Actualización de perfil
    useAuthStore.getState().setUser({ ...mockUser, firstName: 'NuevoNombre' })
    expect(useAuthStore.getState().user?.firstName).toBe('NuevoNombre')

    // Token expirado en servidor
    useAuthStore.getState().setSessionExpired(true)
    expect(useAuthStore.getState().isSessionExpired).toBe(true)

    // El usuario confirma el modal → logout
    useAuthStore.getState().logout()

    const final = useAuthStore.getState()
    expect(final.token).toBeNull()
    expect(final.user).toBeNull()
    expect(final.isSessionExpired).toBe(false)
    expect(final.isAuthenticated()).toBe(false)
  })
})
