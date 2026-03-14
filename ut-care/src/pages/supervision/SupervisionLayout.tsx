import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users, Activity, Calendar, BarChart3 } from 'lucide-react'

const tabs = [
  { to: '/supervision/psychologists', icon: Users, key: 'supervision.tabs.psychologists' as const },
  { to: '/supervision/progress', icon: Activity, key: 'supervision.tabs.progress' as const },
  { to: '/supervision/calendar', icon: Calendar, key: 'supervision.tabs.calendar' as const },
  { to: '/supervision/analytics', icon: BarChart3, key: 'supervision.tabs.analytics' as const },
]

export function SupervisionLayout() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <nav
        className="flex flex-wrap gap-1 border-b border-[var(--border)] pb-2"
        aria-label={t('supervision.tabsLabel')}
      >
        {tabs.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {t(key)}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
