import { api } from '@/lib/api'
import type { AuditLogsResponse, AuditLogFilters } from '@/types/audit-log'

export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLogsResponse> {
  const sp = new URLSearchParams()
  if (filters.page != null) sp.set('page', String(filters.page))
  if (filters.limit != null) sp.set('limit', String(filters.limit))
  if (filters.userId) sp.set('userId', filters.userId)
  if (filters.action) sp.set('action', filters.action)
  if (filters.tableName) sp.set('tableName', filters.tableName)
  if (filters.role) sp.set('role', filters.role)
  if (filters.startDate) sp.set('startDate', filters.startDate)
  if (filters.endDate) sp.set('endDate', filters.endDate)
  const { data } = await api.get<{ success: boolean; data: AuditLogsResponse }>(
    `/audit-logs?${sp}`
  )
  return data.data
}
