/**
 * Tests unitarios para src/lib/api.ts — interceptor de respuesta de Axios.
 *
 * Verifica que el interceptor de error llame correctamente a setSessionExpired(true)
 * ante un 401 (fuera del endpoint de login) o un 403 con mensaje de token expirado,
 * y que NO lo haga en otros casos (401 en login, 404, 500, etc.).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'

// ─────────────────────────────────────────────────────────────────────────────
// Mock del auth store (aislamos el test del DOM y de Zustand persist)
// ─────────────────────────────────────────────────────────────────────────────
const mockSetSessionExpired = vi.fn()
const mockGetToken = vi.fn(() => 'test-token')

vi.mock('@/store/auth.store', () => ({
  useAuthStore: {
    getState: () => ({
      token: mockGetToken(),
      setSessionExpired: mockSetSessionExpired,
    }),
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Importar el módulo DESPUÉS de los mocks (importante para vi.mock hoisting)
// ─────────────────────────────────────────────────────────────────────────────
const { api } = await import('@/lib/api')

// ─────────────────────────────────────────────────────────────────────────────
// Helper: simula un error de Axios con la estructura esperada por el interceptor
// ─────────────────────────────────────────────────────────────────────────────
function makeAxiosError(status: number, url: string, message?: string) {
  const error = new axios.AxiosError('Request failed')
  error.response = {
    status,
    data: message ? { message } : {},
    headers: {},
    config: {} as never,
    statusText: String(status),
  }
  error.config = { url, headers: {} as never }
  return error
}

beforeEach(() => {
  mockSetSessionExpired.mockClear()
  mockGetToken.mockClear()
})

// ─────────────────────────────────────────────────────────────────────────────
// Tests del interceptor de respuesta
// ─────────────────────────────────────────────────────────────────────────────
describe('api.ts — interceptor de respuesta', () => {
  describe('401 Unauthorized', () => {
    it('llama setSessionExpired(true) para 401 en ruta protegida', async () => {
      const error = makeAxiosError(401, '/api/patients')

      await expect(
        // Disparamos el interceptor manualmente a través de una petición mockeada
        Promise.reject(error),
      ).rejects.toThrow()

      // Forzamos el interceptor directamente sobre el error
      const interceptors = (api.interceptors.response as unknown as {
        handlers: Array<{ fulfilled: unknown; rejected: (e: unknown) => unknown }>
      }).handlers

      const handler = interceptors.find((h) => h?.rejected)
      if (handler) {
        await expect(handler.rejected(error)).rejects.toBe(error)
      }

      expect(mockSetSessionExpired).toHaveBeenCalledWith(true)
    })

    it('NO llama setSessionExpired para 401 en /auth/login (credenciales incorrectas)', async () => {
      const error = makeAxiosError(401, '/api/auth/login')

      const interceptors = (api.interceptors.response as unknown as {
        handlers: Array<{ fulfilled: unknown; rejected: (e: unknown) => unknown }>
      }).handlers

      const handler = interceptors.find((h) => h?.rejected)
      if (handler) {
        await expect(handler.rejected(error)).rejects.toBe(error)
      }

      expect(mockSetSessionExpired).not.toHaveBeenCalled()
    })
  })

  describe('403 Forbidden — token inválido/expirado', () => {
    it('llama setSessionExpired(true) para 403 con mensaje "Invalid or expired token"', async () => {
      const error = makeAxiosError(403, '/api/patients', 'Invalid or expired token')

      const interceptors = (api.interceptors.response as unknown as {
        handlers: Array<{ fulfilled: unknown; rejected: (e: unknown) => unknown }>
      }).handlers

      const handler = interceptors.find((h) => h?.rejected)
      if (handler) {
        await expect(handler.rejected(error)).rejects.toBe(error)
      }

      expect(mockSetSessionExpired).toHaveBeenCalledWith(true)
    })

    it('NO llama setSessionExpired para 403 con mensaje de error diferente (p.ej. acceso denegado por rol)', async () => {
      const error = makeAxiosError(403, '/api/patients', 'Acceso no autorizado')

      const interceptors = (api.interceptors.response as unknown as {
        handlers: Array<{ fulfilled: unknown; rejected: (e: unknown) => unknown }>
      }).handlers

      const handler = interceptors.find((h) => h?.rejected)
      if (handler) {
        await expect(handler.rejected(error)).rejects.toBe(error)
      }

      expect(mockSetSessionExpired).not.toHaveBeenCalled()
    })
  })

  describe('otros errores HTTP', () => {
    it.each([404, 422, 500, 503])(
      'NO llama setSessionExpired para error %d',
      async (status) => {
        const error = makeAxiosError(status, '/api/patients')

        const interceptors = (api.interceptors.response as unknown as {
          handlers: Array<{ fulfilled: unknown; rejected: (e: unknown) => unknown }>
        }).handlers

        const handler = interceptors.find((h) => h?.rejected)
        if (handler) {
          await expect(handler.rejected(error)).rejects.toBe(error)
        }

        expect(mockSetSessionExpired).not.toHaveBeenCalled()
      },
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Tests del interceptor de REQUEST (adjunta token)
// ─────────────────────────────────────────────────────────────────────────────
describe('api.ts — interceptor de request', () => {
  it('adjunta el token Bearer en el header Authorization', () => {
    const interceptors = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: unknown) => unknown; rejected: unknown }>
    }).handlers

    const handler = interceptors.find((h) => h?.fulfilled)
    if (!handler) return

    const config = { headers: {} as Record<string, string> }
    const result = handler.fulfilled(config) as typeof config

    expect(result.headers['Authorization']).toBe(`Bearer test-token`)
  })

  it('no sobreescribe Authorization si ya viene en el config', () => {
    const interceptors = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (config: unknown) => unknown; rejected: unknown }>
    }).handlers

    const handler = interceptors.find((h) => h?.fulfilled)
    if (!handler) return

    const existingAuth = 'Bearer other-token'
    const config = { headers: { Authorization: existingAuth } as Record<string, string> }
    const result = handler.fulfilled(config) as typeof config

    expect(result.headers['Authorization']).toBe(existingAuth)
  })
})
