export interface ReportPeriod {
  start: string
  end: string
}

export interface StatisticsReportData {
  period: ReportPeriod
  department: string
  appointments: {
    total: number
    completed: number
    cancelled: number
    byType: Array<{ type: string; count: number }>
  }
  patients: {
    total: number
    newPatients: number
  }
  therapySessions?: number
  nursingConsultations?: {
    totalConsultations: number
    medicationsAdministered: number
    proceduresPerformed: number
  }
}

export interface ConsultationsReportSummary {
  total: number
  byStatus: Array<{ status: string; count: number }>
  byUrgency: Array<{ urgency: string; count: number }>
  byDepartments: Array<{ from: string; to: string; count: number }>
}

export interface ConsultationsReportItem {
  id: string
  patient: string
  enrollmentNumber: string | null
  fromDepartment: string
  toDepartment: string
  fromProfessional: string | null
  toProfessional: string | null
  reason: string
  urgency: string
  status: string
  createdAt: string
  respondedAt: string | null
  respondedBy: string | null
}

export interface ConsultationsReportData {
  period: ReportPeriod
  department: string
  summary: ConsultationsReportSummary
  consultations: ConsultationsReportItem[]
}

export interface DiagnosesReportSummary {
  totalRecords: number
  totalDiagnosesDsm5: number
  totalDiagnosesCie10: number
  mostCommonDsm5: Array<{ diagnosis: string; count: number }>
  mostCommonCie10: Array<{ diagnosis: string; count: number }>
}

export interface DiagnosesReportRecord {
  patient: string
  enrollmentNumber: string | null
  dateOfBirth: string | null
  diagnosisDsm5: string | null
  diagnosisCie10: string | null
  chiefComplaint: string | null
  assignedPsychologist: string | null
  sessionCount: number
  createdAt: string
}

export interface DiagnosesReportData {
  period: ReportPeriod
  department: string
  summary: DiagnosesReportSummary
  records: DiagnosesReportRecord[]
}

/** API department values for reports */
export const REPORT_DEPARTMENT_VALUES = ['', 'psychology', 'nursing'] as const
