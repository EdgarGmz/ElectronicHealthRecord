import { api } from '@/lib/api'

export interface CreateNursingAttentionPayload {
  patientId: string
  motiveAtencion: string
  signosVitales?: {
    presionArterialSys?: number
    presionArterialDia?: number
    temperatura?: number
    frecuenciaCardiaca?: number
    spo2?: number
  }
  diagnosticoRelampago?: string
  tratamientoAplicado?: string
  observaciones?: string
  derivacion?: string
}

export async function createNursingAttention(payload: CreateNursingAttentionPayload) {
  const { data } = await api.post('/nursing-attentions', payload)
  return data
}

