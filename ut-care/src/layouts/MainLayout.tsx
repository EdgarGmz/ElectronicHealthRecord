import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/organisms/Sidebar'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-mesh">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
