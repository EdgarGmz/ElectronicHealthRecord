import { api } from '@/lib/api'
import type {
  PsychometricEvaluation,
  PsychometricEvaluationsResponse,
  CreatePsychometricEvaluationInput,
  UpdatePsychometricEvaluationInput,
} from '@/types/psychometric-evaluation'

export async function getPsychometricEvaluations(params: {
  page?: number
  limit?: number
  psychologyRecordId?: string
  evaluationType?: string
  administeredBy?: string
  applicationDateFrom?: string
  applicationDateTo?: string
} = {}): Promise<PsychometricEvaluationsResponse> {
  const {
    page = 1,
    limit = 10,
    psychologyRecordId,
    evaluationType,
    administeredBy,
    applicationDateFrom,
    applicationDateTo,
  } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (psychologyRecordId) sp.set('psychologyRecordId', psychologyRecordId)
  if (evaluationType) sp.set('evaluationType', evaluationType)
  if (administeredBy) sp.set('administeredBy', administeredBy)
  if (applicationDateFrom) sp.set('applicationDateFrom', applicationDateFrom)
  if (applicationDateTo) sp.set('applicationDateTo', applicationDateTo)
  const { data } = await api.get<{ success: boolean; data: PsychometricEvaluationsResponse }>(
    `/psychometric-tests?${sp}`
  )
  return data.data
}

export async function getPsychometricEvaluationById(id: string): Promise<PsychometricEvaluation> {
  const { data } = await api.get<{ success: boolean; data: PsychometricEvaluation }>(
    `/psychometric-tests/${id}`
  )
  return data.data
}

export async function createPsychometricEvaluation(
  body: CreatePsychometricEvaluationInput
): Promise<PsychometricEvaluation> {
  const payload: Record<string, unknown> = {
    psychologyRecordId: body.psychologyRecordId,
    evaluationType: body.evaluationType,
    applicationDate: body.applicationDate,
  }
  if (body.rawScore !== undefined && body.rawScore !== '') payload.rawScore = Number(body.rawScore)
  if (body.standardScore !== undefined && body.standardScore !== '') payload.standardScore = Number(body.standardScore)
  if (body.percentile !== undefined) payload.percentile = body.percentile
  if (body.interpretation?.trim()) payload.interpretation = body.interpretation.trim()
  if (body.fileUrl?.trim()) payload.fileUrl = body.fileUrl.trim()
  const { data } = await api.post<{ success: boolean; data: PsychometricEvaluation }>(
    '/psychometric-tests',
    payload
  )
  return data.data
}

export async function updatePsychometricEvaluation(
  id: string,
  body: UpdatePsychometricEvaluationInput
): Promise<PsychometricEvaluation> {
  const payload: Record<string, unknown> = {}
  if (body.evaluationType !== undefined) payload.evaluationType = body.evaluationType
  if (body.applicationDate !== undefined) payload.applicationDate = body.applicationDate
  if (body.rawScore !== undefined && body.rawScore !== '') payload.rawScore = Number(body.rawScore)
  if (body.standardScore !== undefined && body.standardScore !== '') payload.standardScore = Number(body.standardScore)
  if (body.percentile !== undefined) payload.percentile = body.percentile
  if (body.interpretation !== undefined) payload.interpretation = body.interpretation
  if (body.fileUrl !== undefined) payload.fileUrl = body.fileUrl
  const { data } = await api.put<{ success: boolean; data: PsychometricEvaluation }>(
    `/psychometric-tests/${id}`,
    payload
  )
  return data.data
}

export async function deletePsychometricEvaluation(id: string): Promise<void> {
  await api.delete(`/psychometric-tests/${id}`)
}
