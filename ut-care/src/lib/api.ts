import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const baseURL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''
    // Solo cerrar sesión en 401 cuando no sea un intento explícito de login
    if (status === 401 && !url.includes('/auth/login')) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)
