export interface AuditLogUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  tableName: string
  recordId: string
  oldValues: unknown
  newValues: unknown
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: AuditLogUser
  eventDetail?: string
}

export interface AuditLogsResponse {
  auditLogs: AuditLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  userId?: string
  action?: string
  tableName?: string
  role?: string
  startDate?: string
  endDate?: string
}
