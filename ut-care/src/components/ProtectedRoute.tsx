import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
