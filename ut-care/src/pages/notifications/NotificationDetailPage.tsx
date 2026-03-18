import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Bell, CheckCircle2, CircleX, Clock, Layers, User, AlertTriangle } from 'lucide-react'
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

const PRIORITY_STYLES: Record<
  string,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  normal: {
    label: 'Normal',
    badge: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--text-muted)]/20',
    icon: <Bell className="h-3.5 w-3.5" />,
  },
  high: {
    label: 'Alta',
    badge: 'bg-amber-500/15 text-amber-700 border-amber-400/30',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  urgent: {
    label: 'Urgente',
    badge: 'bg-red-500/15 text-red-700 border-red-400/30',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
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

  const destinationName =
    notification?.user?.firstName || notification?.user?.lastName
      ? `${notification.user.firstName ?? ''} ${notification.user.lastName ?? ''}`.trim()
      : ''

  const senderName =
    notification?.fromUser?.firstName || notification?.fromUser?.lastName
      ? `${notification.fromUser.firstName ?? ''} ${notification.fromUser.lastName ?? ''}`.trim()
      : destinationName

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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{notification.title}</h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${
                  notification.isRead
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-700'
                    : 'border-red-400/30 bg-red-500/15 text-red-700'
                }`}
              >
                {notification.isRead ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
                {notification.isRead ? t('notifications.read') : t('notifications.unread')}
              </span>
              {notification.priority && (
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-medium ${
                    PRIORITY_STYLES[notification.priority]?.badge ?? PRIORITY_STYLES.normal.badge
                  }`}
                  title={t(`notifications.${PRIORITY_KEY[notification.priority] || notification.priority}`)}
                >
                  {PRIORITY_STYLES[notification.priority]?.icon ?? PRIORITY_STYLES.normal.icon}
                  {notification.priority === 'normal'
                    ? t('notifications.priorityNormal')
                    : notification.priority === 'high'
                      ? t('notifications.priorityHigh')
                      : t('notifications.priorityUrgent')}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-[var(--text-muted)]">{notification.type}</p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDateTime(notification.createdAt)}
              </span>
              {notification.readAt && (
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('notifications.readAt')}: {formatDateTime(notification.readAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{t('notifications.message')}</h2>
        <p className="whitespace-pre-wrap text-[var(--text-secondary)]">{notification.message}</p>
      </GlassCard>
      <GlassCard>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-secondary)] inline-flex items-center gap-2">
              <User className="h-4 w-4" />
              Enviado por:
            </span>{' '}
            <span>{senderName || '—'}</span>
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-secondary)] inline-flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Usuario Destino:
            </span>{' '}
            <span>{destinationName || '—'}</span>
          </p>
          {(notification.relatedEntityType || notification.relatedEntityId) && (
            <p className="text-sm text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text-secondary)] inline-flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Contexto:
              </span>{' '}
              {notification.relatedEntityType ? (
                <>
                  <span>{notification.relatedEntityType}</span>
                  {notification.relatedEntityId ? <span className="ml-2">· ID: {notification.relatedEntityId}</span> : null}
                </>
              ) : (
                <span>{notification.type}</span>
              )}
            </p>
          )}
        </div>
      </GlassCard>
      </>
      )}
    </div>
  )
}
