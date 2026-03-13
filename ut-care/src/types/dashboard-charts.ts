export type PeriodType = 'day' | 'month' | 'year'

export interface DashboardChartData {
  byPeriod: { period: string; psychology: number; nursing: number }[]
  byService: { service: string; count: number }[]
  scatter: { period: string; psychology: number; nursing: number }[]
  histogramPsychology: { bucket: string; count: number }[]
  histogramNursing: { bucket: string; count: number }[]
  radar: { subject: string; psychology: number; nursing: number; fullMark: number }[]
  heatmap: { dayOfWeek: number; dayName: string; psychology: number; nursing: number }[]
  timeline: { name: string; start: string; end: string; type: 'psychology' | 'nursing' }[]
}
