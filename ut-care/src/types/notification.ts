export interface Notification {
  id: string
  userId: string
  fromUserId?: string | null
  type: string
  title: string
  message: string
  relatedEntityType: string | null
  relatedEntityId: string | null
  priority: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    role?: string
  }
  fromUser?: {
    id: string
    firstName: string
    lastName: string
    email: string
    role?: string
  }
}

export interface NotificationsResponse {
  notifications: Notification[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateNotificationInput {
  userId: string
  type: string
  title: string
  message: string
  relatedEntityType?: string
  relatedEntityId?: string
  priority?: string
}

export const NOTIFICATION_PRIORITIES = ['normal', 'high', 'urgent'] as const
