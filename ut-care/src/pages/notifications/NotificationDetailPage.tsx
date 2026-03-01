import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Bell } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'
import { LoadingModal } from '@/components/molecules/LoadingModal'
import { ErrorModal } from '@/components/molecules/ErrorModal'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import {
  getNotificationById,
  markNotificationAsRead,
  deleteNotification,
} from '@/services/notification.service'
import type { Notification } from '@/types/notification'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
}

const PRIORITY_KEY: Record<string, string> = {
  normal: 'priorityNormal',
  high: 'priorityHigh',
  urgent: 'priorityUrgent',
}

export function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getNotificationById(id)
      .then((n) => {
        setNotification(n)
        if (!n.isRead) markNotificationAsRead(id).then((updated) => setNotification(updated)).catch(() => {})
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  const handleDeleteClick = () => setConfirmDeleteOpen(true)
  const handleConfirmDelete = async () => {
    if (!id) return
    setDeleting(true)
    setConfirmDeleteOpen(false)
    try {
      await deleteNotification(id)
      navigate('/notifications', { replace: true })
    } catch {
      setError(t('common.error'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <LoadingModal open={loading || deleting} message={t('common.loading')} />
      <ErrorModal open={!!error} message={error ?? t('notifications.noNotifications')} onClose={() => setError(null)} />
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('notifications.confirmDeleteTitle')}
        message={t('notifications.confirmDeleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        confirming={deleting}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/notifications" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
          <ArrowLeft size={18} />
          {t('notifications.list')}
        </Link>
        {notification && (
        <GlassButton
          type="button"
          onClick={handleDeleteClick}
          disabled={deleting}
          className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
        >
          {deleting ? t('common.loading') : t('common.delete')}
        </GlassButton>
        )}
      </div>
      {!notification && !loading && (
        <GlassCard>
          <p className="text-[var(--text-secondary)]">{t('notifications.noNotifications')}</p>
        </GlassCard>
      )}
      {notification && (
      <>
      <GlassCard className="border-[var(--color-primary)]/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <Bell className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{notification.title}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {notification.type}
              {notification.priority !== 'normal' && ` · ${t(`notifications.${PRIORITY_KEY[notification.priority] || notification.priority}`)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatDateTime(notification.createdAt)}</p>
            {notification.readAt && (
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t('notifications.readAt')}: {formatDateTime(notification.readAt)}</p>
            )}
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('notifications.message')}</h2>
        <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{notification.message}</p>
      </GlassCard>
      {(notification.relatedEntityType || notification.relatedEntityId) && (
        <GlassCard>
          <p className="text-sm text-[var(--text-muted)]">
            {notification.relatedEntityType && <span>Entidad: {notification.relatedEntityType}</span>}
            {notification.relatedEntityId && <span className="ml-2">ID: {notification.relatedEntityId}</span>}
          </p>
        </GlassCard>
      )}
      </>
      )}
    </div>
  )
}
