import { api } from '@/lib/api'
import type { Mood } from '@/types/mood'

export async function getMoods(): Promise<Mood[]> {
  const { data } = await api.get<{ success: boolean; data: Mood[] }>('/moods')
  return data.data
}
