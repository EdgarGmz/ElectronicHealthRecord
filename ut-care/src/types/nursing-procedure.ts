import { User } from "./auth";

export interface NursingConsultation {
  id: string;
  medicalRecordId: string;
  consultationDate: string;
  chiefComplaint?: string;
  vitalSignsTemperature?: number;
  vitalSignsBloodPressureSys?: number;
  vitalSignsBloodPressureDia?: number;
  vitalSignsHeartRate?: number;
  vitalSignsRespiratoryRate?: number;
  vitalSignsOxygenSaturation?: number;
  vitalSignsWeight?: number;
  vitalSignsHeight?: number;
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  observations?: string;
  nurseId: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  nurse: User;
  nursingProcedures?: NursingProcedure[];
}

export interface NursingProcedure {
  id: string;
  nursingConsultationId: string;
  procedureType: string;
  procedureDate: string;
  description: string;
  materialsUsed?: string;
  observations?: string;
  performedBy: string;
  createdAt: string;

  // Relations
  performedByUser: User;
}

export interface CreateNursingConsultationInput {
  medicalRecordId: string;
  consultationDate: string;
  chiefComplaint?: string;
  vitalSignsTemperature?: number;
  vitalSignsBloodPressureSys?: number;
  vitalSignsBloodPressureDia?: number;
  vitalSignsHeartRate?: number;
  vitalSignsRespiratoryRate?: number;
  vitalSignsOxygenSaturation?: number;
  vitalSignsWeight?: number;
  vitalSignsHeight?: number;
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  observations?: string;
  nurseId: string;
}

export interface CreateNursingProcedureInput {
  nursingConsultationId: string;
  procedureType: string;
  procedureDate: string;
  description: string;
  materialsUsed?: string;
  observations?: string;
  performedBy: string;
}
