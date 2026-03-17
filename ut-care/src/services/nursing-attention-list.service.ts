import { api } from '@/lib/api'

export interface NursingAttentionListItem {
  id: string
  patientId: string
  patient: {
    user: {
      firstName: string
      lastName: string
      enrollmentNumber?: string | null
    }
  }
  motive: string
  disposition?: string | null
  createdAt: string
}

export interface NursingAttentionDetail {
  id: string
  patientId: string
  motive: string
  disposition?: string | null
  vitalSigns?: {
    presionArterialSys?: number
    presionArterialDia?: number
    temperatura?: number
    frecuenciaCardiaca?: number
    spo2?: number
  } | null
  lightningDiagnosis?: string | null
  treatment?: string | null
  observations?: string | null
  createdAt: string
  patient?: {
    user: {
      firstName: string
      lastName: string
      enrollmentNumber?: string | null
      email?: string
    }
  }
}

export async function getNursingAttentionById(id: string): Promise<NursingAttentionDetail> {
  const { data } = await api.get<{ success: boolean; data: NursingAttentionDetail }>(
    `/nursing-attentions/${id}`
  )
  return data.data
}

export interface NursingAttentionListParams {
  search?: string
  dateFrom?: string
  dateTo?: string
  disposition?: string
  /** Filter by patient (for patient history). Coordinator sees all; nurse sees only their own. */
  patientId?: string
}

export async function getMyNursingAttentions(params?: NursingAttentionListParams): Promise<NursingAttentionListItem[]> {
  const searchParams = new URLSearchParams()
  if (params?.search?.trim()) searchParams.set('search', params.search.trim())
  if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom)
  if (params?.dateTo) searchParams.set('dateTo', params.dateTo)
  if (params?.disposition?.trim()) searchParams.set('disposition', params.disposition.trim())
  if (params?.patientId) searchParams.set('patientId', params.patientId)
  const qs = searchParams.toString()
  const url = qs ? `/nursing-attentions?${qs}` : '/nursing-attentions'
  const { data } = await api.get<{ success: boolean; data: { attentions: NursingAttentionListItem[] } }>(url)
  return data.data.attentions
}

