export interface NursingProcedureUser {
  id: string
  firstName: string
  lastName: string
  email?: string
}

export interface NursingProcedurePatient {
  id: string
  user: NursingProcedureUser
}

export interface NursingProcedureConsultation {
  id: string
  medicalRecord: {
    patient: NursingProcedurePatient
  }
}

export interface NursingProcedure {
  id: string
  nursingConsultationId: string
  procedureType: string
  procedureDate: string
  description: string
  materialsUsed: string | null
  observations: string | null
  performedBy: string
  createdAt: string
  consultation?: NursingProcedureConsultation
  performedByUser?: { id: string; firstName: string; lastName: string }
}

export interface NursingProceduresResponse {
  procedures: NursingProcedure[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateNursingProcedureInput {
  nursingConsultationId: string
  procedureType: string
  procedureDate: string
  description: string
  materialsUsed?: string
  observations?: string
}
