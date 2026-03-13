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
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { canSeeNavItem } from '@/constants/roles'

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

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const visibleNavItems = navItems.filter((item) => canSeeNavItem(item.to, user?.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-4">
        <span className="text-lg font-bold text-[var(--text-primary)]">EHR</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {visibleNavItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
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
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-black/5 hover:text-[var(--color-error)] dark:hover:bg-white/5"
        >
          <LogOut size={20} />
          {t('auth.logout')}
        </button>
      </div>
    </aside>
  )
}
