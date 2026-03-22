import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, Menu, X, MessageSquare } from 'lucide-react'
import { Sidebar } from '@/components/organisms/Sidebar'
import { UserHeaderBadge } from '@/components/molecules/UserHeaderBadge'
import { DateTimeWeather } from '@/components/molecules/DateTimeWeather'
import { GlobalSettingsDropdown } from '@/components/molecules/GlobalSettingsDropdown'
import { useHeaderBarStore } from '@/store/headerBar.store'
import { useStatusBarElementsStore } from '@/store/statusBarElements.store'
import { useSidebarStore } from '@/store/sidebar.store'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
} from '@/services/notification.service'
import type { Notification } from '@/types/notification'
import { getInterconsultations, getPendingInterconsultationsCount } from '@/services/interconsultation.service'

/** Devuelve la clave i18n del módulo (nav.*) según la ruta actual. */
function getModuleKey(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0] ?? ''
  if (!segment) return 'nav.dashboard'
  const map: Record<string, string> = {
    calendar: 'nav.calendar',
    supervision: 'nav.supervision',
    patients: 'nav.patients',
    appointments: 'nav.appointments',
    sessions: 'nav.sessions',
    medications: 'nav.medications',
    procedures: 'nav.procedures',
    interconsultations: 'nav.interconsultations',
    reports: 'nav.reports',
    evaluations: 'nav.evaluations',
    notifications: 'nav.notifications',
    users: 'nav.users',
    'audit-logs': 'nav.auditLogs',
    admin: 'nav.settings',
    profile: 'nav.profile',
    help: 'nav.help',
  }
  return map[segment] ?? 'nav.dashboard'
}

const SCROLL_DOWN_THRESHOLD = 50
const SCROLL_UP_THRESHOLD = 15
const TOP_THRESHOLD = 20

const DESKTOP_MEDIA = '(min-width: 1024px)'

export function MainLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isDesktop = useMediaQuery(DESKTOP_MEDIA)
  const sidebarCollapsed = useSidebarStore((s) => s.collapsed)
  const headerBarMode = useHeaderBarStore((s) => s.mode)
  const showSettings = useStatusBarElementsStore((s) => s.showSettings)
  const moduleLabel = t(getModuleKey(pathname))
  const [headerVisible, setHeaderVisible] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const lastScrollY = useRef(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastCount, setToastCount] = useState(0)
  const [toastTitle, setToastTitle] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [toastOrigin, setToastOrigin] = useState('')
  const firstFetchRef = useRef(true)
  const lastUnreadRef = useRef(0)

  const [interconsultationsCount, setInterconsultationsCount] = useState(0)
  const [interToastOpen, setInterToastOpen] = useState(false)
  const [interToastCount, setInterToastCount] = useState(0)
  const [interToastTitle, setInterToastTitle] = useState('')
  const [interToastMessage, setInterToastMessage] = useState('')
  const [interToastContext, setInterToastContext] = useState('')
  const firstInterFetchRef = useRef(true)
  const lastInterUnreadRef = useRef(0)

  const buildNotificationOrigin = (n: Notification | null): string => {
    if (!n) return ''
    if (n.relatedEntityType && n.relatedEntityId) return `${n.relatedEntityType} · ID: ${n.relatedEntityId}`
    if (n.relatedEntityType) return String(n.relatedEntityType)
    return String(n.type || '')
  }

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false)
  }, [isDesktop])

  useEffect(() => {
    let cancelled = false

    const fetchUnread = async () => {
      try {
        const r = await getUnreadCount()
        if (cancelled) return

        const current = r.count
        setUnreadCount(current)

        // Evita "toast" en el primer render.
        if (firstFetchRef.current) {
          firstFetchRef.current = false
          lastUnreadRef.current = current
          return
        }

        if (current > lastUnreadRef.current) {
          const delta = current - lastUnreadRef.current
          setToastCount(delta)

          // Cargamos el detalle de la última notificación no leída para mostrarlo visualmente.
          try {
            const r = await getNotifications({ page: 1, limit: 1, isRead: false })
            if (cancelled) return
            const latest = r.notifications?.[0] ?? null
            setToastTitle(latest?.title ?? '')
            setToastMessage(latest?.message ?? '')
            setToastOrigin(buildNotificationOrigin(latest))
          } catch {
            setToastTitle('')
            setToastMessage('')
            setToastOrigin('')
          }

          setToastOpen(true)
        }

        lastUnreadRef.current = current
      } catch {
        // Silencioso: si falla el polling, solo no mostramos la alerta.
      }
    }

    void fetchUnread()
    const intervalId = window.setInterval(fetchUnread, 10000)

    const onVisibilityChange = () => {
      if (cancelled) return
      if (!document.hidden) void fetchUnread()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchPendingInterconsultations = async () => {
      try {
        const r = await getPendingInterconsultationsCount()
        if (cancelled) return

        const current = r.count
        setInterconsultationsCount(current)

        if (firstInterFetchRef.current) {
          firstInterFetchRef.current = false
          lastInterUnreadRef.current = current
          return
        }

        if (current > lastInterUnreadRef.current) {
          const delta = current - lastInterUnreadRef.current
          setInterToastCount(delta)

          try {
            const res = await getInterconsultations({ page: 1, limit: 1, status: 'Pendiente' })
            if (cancelled) return
            const latest = res.interconsultations?.[0] ?? null
            const patientName =
              latest?.patient?.user
                ? `${latest.patient.user.firstName} ${latest.patient.user.lastName}`.trim()
                : ''

            setInterToastTitle(patientName ? `Interconsulta: ${patientName}` : 'Nueva interconsulta pendiente')
            setInterToastMessage(latest?.reason ?? '')
            setInterToastContext(latest?.fromDepartment && latest?.toDepartment ? `${latest.fromDepartment} → ${latest.toDepartment}` : '')
          } catch {
            if (cancelled) return
            setInterToastTitle('Nueva interconsulta pendiente')
            setInterToastMessage('')
            setInterToastContext('')
          }

          setInterToastOpen(true)
        }

        lastInterUnreadRef.current = current
      } catch {
        // Silencioso
      }
    }

    void fetchPendingInterconsultations()
    const intervalId = window.setInterval(fetchPendingInterconsultations, 10000)

    const onVisibilityChange = () => {
      if (cancelled) return
      if (!document.hidden) void fetchPendingInterconsultations()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!interToastOpen) return
    const id = window.setTimeout(() => {
      setInterToastOpen(false)
      setInterToastCount(0)
    }, 8000)
    return () => window.clearTimeout(id)
  }, [interToastOpen])

  useEffect(() => {
    if (!toastOpen) return
    const id = window.setTimeout(() => {
      setToastOpen(false)
      setToastCount(0)
    }, 8000)
    return () => window.clearTimeout(id)
  }, [toastOpen])

  const hideOnScroll = headerBarMode === 'hide-on-scroll'
  const effectiveVisible = hideOnScroll ? headerVisible : true

  useEffect(() => {
    if (!hideOnScroll) return
    const onScroll = () => {
      const y = window.scrollY
      if (y <= TOP_THRESHOLD) {
        setHeaderVisible(true)
      } else if (y > lastScrollY.current) {
        if (y - lastScrollY.current >= SCROLL_DOWN_THRESHOLD) setHeaderVisible(false)
      } else {
        if (lastScrollY.current - y >= SCROLL_UP_THRESHOLD) setHeaderVisible(true)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hideOnScroll])

  return (
    <div className="min-h-screen bg-mesh">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDrawer={!isDesktop}
        unreadCount={unreadCount}
        interconsultationsCount={interconsultationsCount}
      />
      <main
        className={`min-h-screen pl-0 transition-[padding-left] duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <header
          className={`fixed left-0 right-0 top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--border)] bg-[var(--glass-bg)]/80 px-3 backdrop-blur-sm transition-[left,transform] duration-300 ease-in-out lg:gap-4 lg:px-6 ${
            sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
          } ${effectiveVisible ? 'translate-y-0' : '-translate-y-full'}`}
          aria-hidden={!effectiveVisible}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex shrink-0 items-center justify-center rounded-lg p-2 text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] lg:hidden"
            aria-label={t('nav.menu')}
          >
            <Menu size={24} />
          </button>
          <div className="flex min-w-0 shrink items-center gap-2 lg:shrink-0">
            <UserHeaderBadge />
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <span className="truncate text-xs font-bold uppercase tracking-wide text-yellow-500 sm:text-sm md:text-base" aria-current="location">
              {moduleLabel}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 lg:gap-4">
            <DateTimeWeather />
            {showSettings && (
              <div className="hidden sm:block">
                <GlobalSettingsDropdown />
              </div>
            )}
          </div>
        </header>
        <div
          className={`px-3 pb-6 pt-14 transition-[padding-top] duration-300 ease-in-out sm:px-4 lg:px-6 ${
            effectiveVisible ? 'pt-14' : 'pt-6'
          }`}
        >
          <Outlet />
        </div>
      </main>

      {toastOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className="flex w-[340px] max-w-[90vw] items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)]/90 p-3 shadow-xl backdrop-blur-xl"
            role="status"
            aria-live="polite"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
              <Bell size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {toastTitle ? toastTitle : t('notifications.newNotification', 'Nueva notificación')}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Nuevas: {toastCount}
              </p>
              {toastOrigin ? (
                <p className="mt-1 line-clamp-1 text-xs text-[var(--text-secondary)]">
                  Origen: {toastOrigin}
                </p>
              ) : null}
              {toastMessage ? (
                <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
                  {toastMessage}
                </p>
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  setToastOpen(false)
                  setToastCount(0)
                  setToastTitle('')
                  setToastMessage('')
                  setToastOrigin('')
                  try {
                    await markAllNotificationsAsRead()
                    setUnreadCount(0)
                    lastUnreadRef.current = 0
                  } catch {
                    // ignore
                  }
                  navigate('/notifications')
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/15 px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/25"
              >
                {t('notifications.title', 'Notificaciones')}
              </button>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
              aria-label={t('common.close', 'Cerrar')}
              onClick={() => {
                setToastOpen(false)
                setToastCount(0)
                setToastTitle('')
                setToastMessage('')
                setToastOrigin('')
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {interToastOpen && (
        <div className="fixed bottom-24 right-4 z-50">
          <div
            className="flex w-[340px] max-w-[90vw] items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--glass-bg)]/90 p-3 shadow-xl backdrop-blur-xl"
            role="status"
            aria-live="polite"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-warning)]/15 text-[var(--color-warning)]">
              <MessageSquare size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {interToastTitle || 'Nueva interconsulta'}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Nuevas: {interToastCount}
              </p>
              {interToastContext ? (
                <p className="mt-1 line-clamp-1 text-xs text-[var(--text-secondary)]">
                  {interToastContext}
                </p>
              ) : null}
              {interToastMessage ? (
                <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
                  {interToastMessage}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setInterToastOpen(false)
                  setInterToastCount(0)
                  setInterToastTitle('')
                  setInterToastMessage('')
                  setInterToastContext('')
                  navigate('/interconsultations')
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--color-warning)]/15 px-3 py-1.5 text-xs font-medium text-[var(--color-warning)] hover:bg-[var(--color-warning)]/25"
              >
                Ver interconsultas
              </button>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
              aria-label={t('common.close', 'Cerrar')}
              onClick={() => {
                setInterToastOpen(false)
                setInterToastCount(0)
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
