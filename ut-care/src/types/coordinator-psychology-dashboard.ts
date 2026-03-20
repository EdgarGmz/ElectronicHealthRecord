export interface RiskAlertItem {
  patientId: string
  patientName: string
  suicideRiskLevel: string
  lastSessionDate: string | null
  psychologyRecordId: string
}

export interface AgendaItem {
  id: string
  scheduledDate: string
  patientName: string
  professionalName: string
  appointmentType: string
  status: string
  durationMinutes: number
  tag?: 'first' | 'follow_up' | 'discharge_soon'
}

export interface ClinicalMetrics {
  churnRatePercent: number
  churnDenominator: number
  churnNumerator: number
  averageProgressScales: { scale: string; averageChange: number; sampleSize: number }[]
  topDiagnoses: { diagnosis: string; count: number; percent: number }[]
  moodDistribution: { mood: string; count: number; percent: number }[]
}

export interface WorkloadItem {
  professionalId: string
  professionalName: string
  hoursThisWeek: number
  overRecommended: boolean
}

export interface CoordinatorPsychologyDashboardData {
  riskAlerts: RiskAlertItem[]
  crisisFollowUp: RiskAlertItem[]
  agendaToday: AgendaItem[]
  appointmentsToConfirm: AgendaItem[]
  clinicalMetrics: ClinicalMetrics
  workload: WorkloadItem[]
  groundingPhrase: string
}
