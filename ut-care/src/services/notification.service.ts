import { api } from '@/lib/api'
import type {
  Notification,
  NotificationsResponse,
  CreateNotificationInput,
} from '@/types/notification'

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

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`)
}
