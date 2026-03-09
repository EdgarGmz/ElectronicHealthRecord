import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

function getRoleLabel(role: string | undefined, t: (key: string) => string): string {
  if (!role) return ''
  const key = `roles.${role.toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : role
}

export function UserHeaderBadge() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  if (!user) return null

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
  const roleLabel = getRoleLabel(user.role, t)

  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
      <User size={18} className="shrink-0 text-[var(--color-primary)]" aria-hidden />
      <span className="font-medium">
        {fullName}
        {roleLabel && (
          <span className="ml-1 font-normal text-[var(--text-secondary)]">({roleLabel})</span>
        )}
      </span>
    </div>
  )
}
