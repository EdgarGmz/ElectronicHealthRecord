import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Bell, ChevronLeft, ChevronRight, CheckCheck, Check, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from '@/services/notification.service'
import type { Notification } from '@/types/notification'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

const PRIORITY_KEY: Record<string, string> = {
  normal: 'priorityNormal',
  high: 'priorityHigh',
  urgent: 'priorityUrgent',
}

export function NotificationListPage() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReadFilter, setIsReadFilter] = useState<string>('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  const loadList = () => {
    setLoading(true)
    setError(null)
    const isRead = isReadFilter === 'true' ? true : isReadFilter === 'false' ? false : undefined
    getNotifications({
      page,
      limit: 10,
      isRead,
      priority: priority || undefined,
    })
      .then((r) => {
        setNotifications(r.notifications)
        setPagination(r.pagination)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }

  const loadUnreadCount = () => {
    getUnreadCount().then((r) => setUnreadCount(r.count)).catch(() => {})
  }

  useEffect(() => {
    loadList()
  }, [page, isReadFilter, priority, t])

  useEffect(() => {
    loadUnreadCount()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      loadList()
      loadUnreadCount()
    } catch {
      setError(t('common.error'))
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      )
      loadUnreadCount()
    } catch {
      setError(t('common.error'))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      loadUnreadCount()
    } catch {
      setError(t('common.error'))
    }
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {unreadCount} {t('notifications.unread')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <GlassButton onClick={handleMarkAllRead} className="inline-flex items-center gap-2">
              <CheckCheck size={18} />
              {t('notifications.markAllRead')}
            </GlassButton>
          )}
          <Link to="/notifications/new" className="glass-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium">
            <Plus size={18} />
            {t('notifications.newNotification')}
          </Link>
        </div>
      </div>
      <GlassCard>
        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={isReadFilter}
            onChange={(e) => { setIsReadFilter(e.target.value); setPage(1) }}
            className="glass-input w-full sm:w-36 px-4 py-2.5 text-sm"
          >
            <option value="">{t('notifications.all')}</option>
            <option value="false">{t('notifications.unread')}</option>
            <option value="true">{t('notifications.read')}</option>
          </select>
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1) }}
            className="glass-input w-full sm:w-36 px-4 py-2.5 text-sm"
          >
            <option value="">{t('notifications.priority')}</option>
            <option value="normal">{t('notifications.priorityNormal')}</option>
            <option value="high">{t('notifications.priorityHigh')}</option>
            <option value="urgent">{t('notifications.priorityUrgent')}</option>
          </select>
        </div>
        {loading ? null : notifications.length === 0 ? (
          <p className="py-8 text-center text-[var(--text-secondary)]">{t('notifications.noNotifications')}</p>
        ) : (
          <>
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    n.isRead ? 'border-[var(--border)] bg-transparent' : 'border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/15">
                    <Bell size={20} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/notifications/${n.id}`} className="font-medium text-[var(--text-primary)] hover:underline">
                        {n.title}
                      </Link>
                      <span className="text-xs text-[var(--text-muted)]">{n.type}</span>
                      {n.priority !== 'normal' && (
                        <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-[var(--color-warning)]/15 text-[var(--color-warning)]">
                          {t(`notifications.${PRIORITY_KEY[n.priority] || n.priority}`)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-[var(--text-secondary)]">{n.message}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--color-primary)] dark:hover:bg-white/5"
                        title={t('notifications.markAsRead')}
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--color-error)] dark:hover:bg-white/5"
                      title={t('common.delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <p className="text-sm text-[var(--text-muted)]">
                  {t('notifications.page')} {pagination.page} {t('notifications.of')} {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                    {t('notifications.previous')}
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="glass-button inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {t('notifications.next')}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  )
}
