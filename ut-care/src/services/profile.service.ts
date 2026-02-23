import { api } from '@/lib/api'
import type { Profile, UpdateProfileInput } from '@/types/profile'

export async function getMyProfile(): Promise<Profile> {
  const { data } = await api.get<{ success: boolean; data: Profile }>('/users/me')
  return data.data
}

export async function updateMyProfile(input: UpdateProfileInput): Promise<Profile> {
  const { data } = await api.put<{ success: boolean; data: Profile }>('/users/me', input)
  return data.data
}
