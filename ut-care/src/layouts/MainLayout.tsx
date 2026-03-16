import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/organisms/Sidebar'
import { UserHeaderBadge } from '@/components/molecules/UserHeaderBadge'
import { DateTimeWeather } from '@/components/molecules/DateTimeWeather'
import { GlobalSettingsDropdown } from '@/components/molecules/GlobalSettingsDropdown'
import { useHeaderBarStore } from '@/store/headerBar.store'
import { useStatusBarElementsStore } from '@/store/statusBarElements.store'
import { useSidebarStore } from '@/store/sidebar.store'
import { useMediaQuery } from '@/hooks/useMediaQuery'

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
  const { t } = useTranslation()
  const isDesktop = useMediaQuery(DESKTOP_MEDIA)
  const sidebarCollapsed = useSidebarStore((s) => s.collapsed)
  const headerBarMode = useHeaderBarStore((s) => s.mode)
  const showSettings = useStatusBarElementsStore((s) => s.showSettings)
  const moduleLabel = t(getModuleKey(pathname))
  const [headerVisible, setHeaderVisible] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false)
  }, [isDesktop])

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
    </div>
  )
}
