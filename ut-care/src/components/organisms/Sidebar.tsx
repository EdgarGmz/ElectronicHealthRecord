import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  FileText,
  Pill,
  Stethoscope,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Bell,
  ClipboardCheck,
  Settings2,
  Settings,
  User,
  UserCog,
  HelpCircle,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useSidebarStore } from '@/store/sidebar.store'
import { canSeeNavItem } from '@/constants/roles'
import { ConfirmModal } from '@/components/molecules/ConfirmModal'
import { LoadingModal } from '@/components/molecules/LoadingModal'

export interface SidebarProps {
  /** En móvil/tablet: si el drawer está abierto. */
  open?: boolean
  /** En móvil/tablet: callback al cerrar (backdrop o botón). */
  onClose?: () => void
  /** true = drawer deslizable (oculto por defecto); false = barra fija siempre visible. */
  isDrawer?: boolean
}

const navItems = [
  { to: '/', icon: LayoutDashboard, key: 'nav.dashboard' },
  // Procedimientos y atención de enfermería como prioridad alta
  { to: '/procedures', icon: Stethoscope, key: 'nav.procedures' },
  { to: '/nursing-attention', icon: Stethoscope, key: 'nav.nursingAttention' },
  { to: '/calendar', icon: CalendarDays, key: 'nav.calendar' },
  { to: '/supervision', icon: UserCog, key: 'nav.supervision' },
  { to: '/patients', icon: Users, key: 'nav.patients' },
  { to: '/appointments', icon: Calendar, key: 'nav.appointments' },
  { to: '/sessions', icon: FileText, key: 'nav.sessions' },
  { to: '/evaluations', icon: ClipboardList, key: 'nav.evaluations' },
  { to: '/medications', icon: Pill, key: 'nav.medications' },
  { to: '/interconsultations', icon: MessageSquare, key: 'nav.interconsultations' },
  { to: '/reports', icon: BarChart3, key: 'nav.reports' },
  { to: '/notifications', icon: Bell, key: 'nav.notifications' },
  { to: '/users', icon: Settings2, key: 'nav.users' },
  { to: '/audit-logs', icon: ClipboardCheck, key: 'nav.auditLogs' },
]

export function Sidebar({ open = true, onClose, isDrawer = false }: SidebarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)
  /** En tablet/móvil (drawer) el menú siempre se muestra expandido; colapso solo en desktop. */
  const effectiveCollapsed = collapsed && !isDrawer
  const visibleNavItems = navItems.filter((item) => canSeeNavItem(item.to, user?.role))
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false)
    setLoggingOut(true)
    // Breve pausa para que el usuario vea "Saliendo del sistema" con el spinner
    setTimeout(() => {
      logout()
      navigate('/login')
      setLoggingOut(false)
    }, 400)
  }

  return (
    <>
      {isDrawer && open && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label={t('common.close')}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[var(--border)] bg-[var(--glass-bg)] shadow-xl backdrop-blur-xl transition-[width] duration-300 ease-in-out ${
          isDrawer
            ? 'w-64 max-w-[85vw]'
            : effectiveCollapsed
              ? 'w-20 lg:w-20'
              : 'w-64 lg:w-64'
        } ${isDrawer && !open ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="flex h-14 min-h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-3 lg:h-16">
          {effectiveCollapsed ? (
            <span className="text-lg font-bold text-[var(--text-primary)]" title="UT-Care">U</span>
          ) : (
            <span className="text-lg font-bold text-[var(--text-primary)]">UT-Care</span>
          )}
          <div className="flex items-center gap-0.5">
            {isDrawer && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] lg:hidden"
                aria-label={t('common.close')}
              >
                <X size={22} />
              </button>
            )}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden rounded-lg p-2 text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] lg:block"
              aria-label={effectiveCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
              title={effectiveCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
            >
              {effectiveCollapsed ? <PanelLeft size={22} /> : <PanelLeftClose size={22} />}
            </button>
          </div>
        </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {visibleNavItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => isDrawer && onClose?.()}
            title={effectiveCollapsed ? t(key) : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
                effectiveCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } ${
                isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} className="shrink-0" />
            {!effectiveCollapsed && <span>{t(key)}</span>}
          </NavLink>
        ))}
        <div className="my-2 border-t border-[var(--border)]" />
        <NavLink
          to="/admin"
          onClick={() => isDrawer && onClose?.()}
          title={effectiveCollapsed ? t('nav.settings') : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
              effectiveCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            } ${
              isActive ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`
          }
        >
          <Settings size={20} className="shrink-0" />
          {!effectiveCollapsed && <span>{t('nav.settings')}</span>}
        </NavLink>
        <NavLink
          to="/profile"
          onClick={() => isDrawer && onClose?.()}
          title={effectiveCollapsed ? t('nav.profile') : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
              effectiveCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            } ${
              isActive ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`
          }
        >
          <User size={20} className="shrink-0" />
          {!effectiveCollapsed && <span>{t('nav.profile')}</span>}
        </NavLink>
        <NavLink
          to="/help"
          onClick={() => isDrawer && onClose?.()}
          title={effectiveCollapsed ? t('nav.help') : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
              effectiveCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            } ${
              isActive ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`
          }
        >
          <HelpCircle size={20} className="shrink-0" />
          {!collapsed && <span>{t('nav.help')}</span>}
        </NavLink>
      </nav>
      <div className={`border-t border-[var(--border)] p-3 ${effectiveCollapsed ? 'flex flex-col items-center' : ''}`}>
        <button
          type="button"
          onClick={handleLogoutClick}
          title={effectiveCollapsed ? t('auth.logout') : undefined}
          className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-black/5 hover:text-[var(--color-error)] dark:hover:bg-white/5 ${
            effectiveCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {!effectiveCollapsed && <span>{t('auth.logout')}</span>}
        </button>
      </div>

      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title={t('auth.logoutConfirmTitle')}
        message={t('auth.logoutConfirmMessage')}
        confirmLabel={t('auth.logout')}
        variant="default"
      />
      <LoadingModal open={loggingOut} message={t('auth.loggingOut')} />
    </aside>
    </>
  )
}
