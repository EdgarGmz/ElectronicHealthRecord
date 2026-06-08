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
    // Solo cerrar sesión en 401 cuando no sea un intento explícito de login
    if (status === 401 && !url.includes('/auth/login')) {
      useAuthStore.getState().setSessionExpired(true)
    }
    return Promise.reject(err)
  }
)
