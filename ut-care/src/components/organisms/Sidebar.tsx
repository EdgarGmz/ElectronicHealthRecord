import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Calendar,
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
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
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
  { to: '/patients', icon: Users, key: 'nav.patients' },
  { to: '/appointments', icon: Calendar, key: 'nav.appointments' },
  { to: '/sessions', icon: FileText, key: 'nav.sessions' },
  { to: '/medications', icon: Pill, key: 'nav.medications' },
  { to: '/procedures', icon: Stethoscope, key: 'nav.procedures' },
  { to: '/interconsultations', icon: MessageSquare, key: 'nav.interconsultations' },
  { to: '/reports', icon: BarChart3, key: 'nav.reports' },
  { to: '/evaluations', icon: ClipboardList, key: 'nav.evaluations' },
  { to: '/notifications', icon: Bell, key: 'nav.notifications' },
  { to: '/users', icon: Settings2, key: 'nav.users' },
  { to: '/audit-logs', icon: ClipboardCheck, key: 'nav.auditLogs' },
]

export function Sidebar({ open = true, onClose, isDrawer = false }: SidebarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--glass-bg)] shadow-xl backdrop-blur-xl transition-transform duration-300 ease-in-out lg:max-w-none lg:shadow-none ${
          isDrawer && !open ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="flex h-14 min-h-14 items-center justify-between gap-2 border-b border-[var(--border)] px-4 lg:h-16">
          <span className="text-lg font-bold text-[var(--text-primary)]">EHR</span>
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
        </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {visibleNavItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => isDrawer && onClose?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} />
            {t(key)}
          </NavLink>
        ))}
        <div className="my-2 border-t border-[var(--border)]" />
        <NavLink
          to="/admin"
          onClick={() => isDrawer && onClose?.()}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`
          }
        >
          <Settings size={20} />
          {t('nav.settings')}
        </NavLink>
        <NavLink
          to="/profile"
          onClick={() => isDrawer && onClose?.()}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`
          }
        >
          <User size={20} />
          {t('nav.profile')}
        </NavLink>
        <NavLink
          to="/help"
          onClick={() => isDrawer && onClose?.()}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`
          }
        >
          <HelpCircle size={20} />
          {t('nav.help')}
        </NavLink>
      </nav>
      <div className="space-y-2 border-t border-[var(--border)] p-3">
        <div className="text-xs text-[var(--text-muted)]">
          {user?.firstName} {user?.lastName}
        </div>
        <button
          type="button"
          onClick={handleLogoutClick}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-black/5 hover:text-[var(--color-error)] dark:hover:bg-white/5"
        >
          <LogOut size={20} />
          {t('auth.logout')}
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
