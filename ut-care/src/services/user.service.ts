import { api } from '@/lib/api'
import type { User, UsersResponse, CreateUserInput, UpdateUserInput } from '@/types/user'

export async function getUsers(params: {
  page?: number
  limit?: number
  search?: string
} = {}): Promise<UsersResponse> {
  const { page = 1, limit = 10, search } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search?.trim()) sp.set('search', search.trim())
  const { data } = await api.get<{ success: boolean; data: UsersResponse }>(`/users?${sp}`)
  return data.data
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await api.get<{ success: boolean; data: User }>(`/users/${id}`)
  return data.data
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const payload: Record<string, unknown> = { ...input }
  if (input.dateOfBirth !== undefined && input.dateOfBirth !== '') {
    payload.dateOfBirth = new Date(input.dateOfBirth).toISOString()
  } else {
    delete payload.dateOfBirth
  }
  const { data } = await api.post<{ success: boolean; data: User }>(`/users`, payload)
  return data.data
}

export async function updateUser(id: string, input: UpdateUserInput, adminPassword?: string): Promise<User> {
  const payload: Record<string, unknown> = { ...input }
  if (input.dateOfBirth !== undefined && input.dateOfBirth !== '') {
    payload.dateOfBirth = new Date(input.dateOfBirth).toISOString()
  } else {
    delete payload.dateOfBirth
  }
  const config = adminPassword ? { headers: { 'x-admin-password': adminPassword } } : undefined
  const { data } = await api.put<{ success: boolean; data: User }>(`/users/${id}`, payload, config)
  return data.data
}

/** Deactivate user (API implements soft-delete by setting isActive=false) */
export async function deactivateUser(id: string, adminPassword?: string): Promise<void> {
  const config = adminPassword ? { headers: { 'x-admin-password': adminPassword } } : undefined
  await api.delete(`/users/${id}`, config)
}

