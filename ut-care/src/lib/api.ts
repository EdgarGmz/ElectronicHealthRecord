import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

// En desarrollo usar siempre /api para que el proxy de Vite envíe las peticiones al backend (evita CORS y 401).
const baseURL =
  import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api')

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''
    const message = err.response?.data?.message || ''

    // Cerrar sesión si el token es inválido o expiró (401 o 403 con mensaje específico de token)
    const isUnauthorized = status === 401 && !url.includes('/auth/login')
    const isTokenExpiredForbidden = status === 403 && message === 'Invalid or expired token'

    if (isUnauthorized || isTokenExpiredForbidden) {
      useAuthStore.getState().setSessionExpired(true)
    }
    return Promise.reject(err)
  }
)
