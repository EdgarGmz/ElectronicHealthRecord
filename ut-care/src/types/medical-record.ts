/** User fields returned in medical record context */
export interface MedicalRecordUser {
  id: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  phone?: string | null
  enrollmentNumber?: string | null
}

export interface MedicalRecordCareer {
  id: string
  name: string
  code: string | null
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  phoneSecondary?: string | null
  priority: number
}

export interface MedicalRecordPatient {
  id: string
  userId: string
  patientType: string
  user: MedicalRecordUser
  career: MedicalRecordCareer
  emergencyContacts: EmergencyContact[]
}

export interface UserBasic {
  id: string
  firstName: string
  lastName: string
  role: string
}

export interface PsychologyRecordAssigned {
  id: string
  firstName: string
  lastName: string
}

export interface PsychologyRecord {
  id: string
  medicalRecordId: string
  initialEvaluationDate: string | null
  chiefComplaint: string | null
  psychologicalHistory: string | null
  psychiatricHistory: string | null
  substanceUse: string | null
  suicideRiskLevel: string
  violenceRiskLevel: string
  currentDiagnosisDsm5: string | null
  currentDiagnosisCie10: string | null
  supportNetwork: string | null
  assignedPsychologistId: string | null
  assignedPsychologist: PsychologyRecordAssigned | null
  createdAt: string
  updatedAt: string
}

export interface NursingConsultationNurse {
  id: string
  firstName: string
  lastName: string
}

export interface NursingConsultation {
  id: string
  medicalRecordId: string
  consultationDate: string
  chiefComplaint: string | null
  vitalSignsTemperature?: number | null
  vitalSignsBloodPressureSys?: number | null
  vitalSignsBloodPressureDia?: number | null
  vitalSignsHeartRate?: number | null
  vitalSignsRespiratoryRate?: number | null
  vitalSignsOxygenSaturation?: number | null
  vitalSignsWeight?: number | null
  vitalSignsHeight?: number | null
  physicalExamination: string | null
  diagnosis: string | null
  treatmentPlan: string | null
  observations: string | null
  nurseId: string
  nurse: NursingConsultationNurse
  createdAt: string
  updatedAt: string
}

export interface MedicalRecord {
  id: string
  patientId: string
  bloodType: string | null
  allergies: string | null
  chronicConditions: string | null
  currentMedications: string | null
  familyHistory: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  patient: MedicalRecordPatient
  createdByUser?: UserBasic
  updatedByUser?: UserBasic
  psychologyRecord: PsychologyRecord | null
  nursingConsultations: NursingConsultation[]
}
