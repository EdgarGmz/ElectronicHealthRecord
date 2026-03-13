import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Bell, ChevronLeft, ChevronRight, CheckCheck, Check, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from '@/services/notification.service'
import { getDefaultTableLimit } from '@/store/tablePageSize.store'
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
  const [limit, setLimit] = useState(() => getDefaultTableLimit())
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadList = () => {
    setLoading(true)
    setError(null)
    const isRead = isReadFilter === 'true' ? true : isReadFilter === 'false' ? false : undefined
    getNotifications({
      page,
      limit,
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
  }, [page, limit, isReadFilter, priority, t])

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

  const handleDeleteClick = (id: string) => setConfirmDeleteId(id)
  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return
    setDeleting(true)
    try {
      await deleteNotification(confirmDeleteId)
      setNotifications((prev) => prev.filter((n) => n.id !== confirmDeleteId))
      loadUnreadCount()
      setConfirmDeleteId(null)
    } catch {
      setError(t('common.error'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading || deleting} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? undefined} onClose={() => setError(null)} />
      <ConfirmModal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title={t('notifications.confirmDeleteTitle')}
        message={t('notifications.confirmDeleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        confirming={deleting}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {unreadCount > 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            {unreadCount} {t('notifications.unread')}
          </p>
        ) : (
          <span />
        )}
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
                  className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-transparent px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5">
                    <Bell size={20} className="text-[var(--text-secondary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/notifications/${n.id}`} className="font-medium text-[var(--text-primary)] hover:underline">
                        {n.title}
                      </Link>
                      <span className="text-xs text-[var(--text-muted)]">{n.type}</span>
                      {n.priority !== 'normal' && (
                        <span className="text-xs text-[var(--text-muted)]">
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
                      onClick={() => handleDeleteClick(n.id)}
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--color-error)] dark:hover:bg-white/5"
                      title={t('common.delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {(pagination.totalPages > 1 || limit !== 10) && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-[var(--text-muted)]">
                    {t('notifications.page')} {pagination.page} {t('notifications.of')} {pagination.totalPages}
                  </p>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <span>{t('table.rowsPerPage')}</span>
                    <select
                      value={limit}
                      onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
                      className="glass-input rounded-lg px-2 py-1 text-sm"
                    >
                      {[5, 10, 15, 20].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                </div>
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
