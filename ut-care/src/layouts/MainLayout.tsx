import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/organisms/Sidebar'
import { UserHeaderBadge } from '@/components/molecules/UserHeaderBadge'
import { DateTimeWeather } from '@/components/molecules/DateTimeWeather'
import { GlobalSettingsDropdown } from '@/components/molecules/GlobalSettingsDropdown'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-mesh">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--glass-bg)]/80 px-6 backdrop-blur-sm">
          <UserHeaderBadge />
          <div className="flex items-center gap-4">
            <DateTimeWeather />
            <GlobalSettingsDropdown />
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
