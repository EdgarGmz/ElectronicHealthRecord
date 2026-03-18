import { api } from '@/lib/api'
import type {
  Notification,
  NotificationsResponse,
  CreateNotificationInput,
} from '@/types/notification'
import type { User } from '@/types/user'

export async function getNotifications(params: {
  page?: number
  limit?: number
  isRead?: boolean
  type?: string
  priority?: string
} = {}): Promise<NotificationsResponse> {
  const { page = 1, limit = 10, isRead, type, priority } = params
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (isRead !== undefined) sp.set('isRead', String(isRead))
  if (type) sp.set('type', type)
  if (priority) sp.set('priority', priority)
  const { data } = await api.get<{ success: boolean; data: NotificationsResponse }>(
    `/notifications?${sp}`
  )
  return data.data
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const { data } = await api.get<{ success: boolean; data: { count: number } }>(
    '/notifications/unread-count'
  )
  return data.data
}

export async function getNotificationById(id: string): Promise<Notification> {
  const { data } = await api.get<{ success: boolean; data: Notification }>(
    `/notifications/${id}`
  )
  return data.data
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const { data } = await api.put<{ success: boolean; data: Notification }>(
    `/notifications/${id}/read`
  )
  return data.data
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const { data } = await api.put<{ success: boolean; data: { count: number } }>(
    '/notifications/mark-all-read'
  )
  return data.data
}

export async function createNotification(body: CreateNotificationInput): Promise<Notification> {
  const { data } = await api.post<{ success: boolean; data: Notification }>(
    '/notifications',
    body
  )
  return data.data
}

export async function getNotificationRecipients(params: {
  relatedEntityType: string
  relatedEntityId: string
}): Promise<User[]> {
  const sp = new URLSearchParams({
    relatedEntityType: params.relatedEntityType,
    relatedEntityId: params.relatedEntityId,
  })
  const { data } = await api.get<{ success: boolean; data: { recipients: User[] } }>(`/notifications/recipients?${sp}`)
  return data.data.recipients
}

export async function getAllNotificationRecipients(params: {
  limit?: number
  search?: string
} = {}): Promise<User[]> {
  const sp = new URLSearchParams()
  if (params.limit) sp.set('limit', String(params.limit))
  if (params.search) sp.set('search', params.search)

  const { data } = await api.get<{ success: boolean; data: { recipients: User[] } }>(
    `/notifications/recipients/all${sp.toString() ? `?${sp.toString()}` : ''}`
  )

  return data.data.recipients
}

export async function getRecentPrescriptions(limit: number = 20): Promise<Array<{ id: string; label: string }>> {
  const sp = new URLSearchParams({ limit: String(limit) })
  const { data } = await api.get<{ success: boolean; data: { prescriptions: Array<{ id: string; label: string }> } }>(
    `/notifications/prescriptions/recent?${sp}`
  )
  return data.data.prescriptions
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`)
}
