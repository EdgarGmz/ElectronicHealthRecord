import { api } from '@/lib/api'
import type { Career } from '@/types/career'

/**
 * Obtiene la lista de carreras activas.
 */
export async function getCareers(): Promise<Career[]> {
  const { data } = await api.get<{ success: boolean; data: Career[] }>('/careers')
  return data.data
}

/**
 * Obtiene todas las carreras con la cantidad de alumnos (vista del admin).
 */
export async function getCareersAdmin(): Promise<Career[]> {
  const { data } = await api.get<{ success: boolean; data: Career[] }>('/careers/admin')
  return data.data
}

/**
 * Crea una nueva carrera.
 */
export async function createCareer(data: { name: string; code: string }): Promise<Career> {
  const { data: res } = await api.post<{ success: boolean; data: Career }>('/careers', data)
  return res.data
}

/**
 * Actualiza una carrera existente.
 */
export async function updateCareer(
  id: string,
  data: { name?: string; code?: string; isActive?: boolean }
): Promise<Career> {
  const { data: res } = await api.put<{ success: boolean; data: Career }>(`/careers/${id}`, data)
  return res.data
}

/**
 * Elimina una carrera existente.
 */
export async function deleteCareer(id: string): Promise<void> {
  await api.delete<{ success: boolean }>(`/careers/${id}`)
}
