import { api } from '@/lib/api'

export type MedicationStockLevel = 'low' | 'medium' | 'high'

export interface MedicationLowStockItem {
  id: string
  name: string
  stock: number
}

export interface MedicationStockSummary {
  distribution: Record<MedicationStockLevel, number>
  lowStock: MedicationLowStockItem[]
}

export async function getMedicationStockSummary(): Promise<MedicationStockSummary> {
  const { data } = await api.get<{
    success: boolean
    message?: string
    data: MedicationStockSummary
  }>('/dashboard/medication-stock-summary')

  return data.data
}

