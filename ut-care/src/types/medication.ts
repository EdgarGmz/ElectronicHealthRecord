export interface Medication {
  id: string
  name: string
  genericName: string
  category: string | null
  dosageForms: string | null
  commonDosages: string | null
  administrationRoutes: string | null
  contraindications: string | null
  sideEffects: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MedicationWithPrescriptions extends Medication {
  prescriptions?: Array<{
    id: string
    patient?: {
      user?: { firstName: string; lastName: string; enrollmentNumber?: string | null }
    }
  }>
}

export interface MedicationsResponse {
  medications: Medication[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateMedicationInput {
  name: string
  genericName: string
  category?: string
  dosageForms?: string
  commonDosages?: string
  administrationRoutes?: string
  contraindications?: string
  sideEffects?: string
}

export interface UpdateMedicationInput extends Partial<CreateMedicationInput> {
  isActive?: boolean
}
