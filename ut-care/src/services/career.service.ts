import { api } from '@/lib/api'
import type { Career } from '@/types/career'

export async function getCareers(): Promise<Career[]> {
  const { data } = await api.get<{ success: boolean; data: Career[] }>('/careers')
  return data.data
}
