import { useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { canAccessPath } from '@/constants/roles'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import type { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
}

/**
 * Renders children only if the current user's role can access the current path.
 * Otherwise renders UnauthorizedPage (Acceso no autorizado / Unauthorized access).
 */
export function RoleGuard({ children }: RoleGuardProps) {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const pathname = location.pathname
  const allowed = canAccessPath(pathname, user?.role)

  if (!allowed) return <UnauthorizedPage />
  return <>{children}</>
}
