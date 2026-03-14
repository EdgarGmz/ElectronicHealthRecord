import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useStatusBarElementsStore } from '@/store/statusBarElements.store'

function getRoleLabel(role: string | undefined, t: (key: string) => string): string {
  if (!role) return ''
  const key = `roles.${role.toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : role
}

export function UserHeaderBadge() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const showUserName = useStatusBarElementsStore((s) => s.showUserName)
  const showRole = useStatusBarElementsStore((s) => s.showRole)

  if (!user) return null
  if (!showUserName && !showRole) return null

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
  const shortName = user.firstName?.trim() || user.email
  const roleLabel = getRoleLabel(user.role, t)

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--text-primary)]">
      <User size={18} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
      <span className="min-w-0 truncate font-medium">
        {showUserName && (
          <>
            <span className="sm:hidden" title={fullName}>{shortName}</span>
            <span className="hidden sm:inline">{fullName}</span>
          </>
        )}
        {showUserName && showRole && roleLabel && <span className="hidden sm:inline"> </span>}
        {showRole && roleLabel && (
          <span className="hidden font-normal text-[var(--text-secondary)] sm:inline">
            {showUserName ? `(${roleLabel})` : roleLabel}
          </span>
        )}
      </span>
    </div>
  )
}
