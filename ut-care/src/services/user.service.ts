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
  const payload: Record<string, unknown> = {
    ...input,
    dateOfBirth: new Date(input.dateOfBirth).toISOString(),
  }
  const { data } = await api.post<{ success: boolean; data: User }>(`/users`, payload)
  return data.data
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const payload: Record<string, unknown> = { ...input }
  if (input.dateOfBirth !== undefined) payload.dateOfBirth = new Date(input.dateOfBirth).toISOString()
  const { data } = await api.put<{ success: boolean; data: User }>(`/users/${id}`, payload)
  return data.data
}

/** Deactivate user (API implements soft-delete by setting isActive=false) */
export async function deactivateUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}

