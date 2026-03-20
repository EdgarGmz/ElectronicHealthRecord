import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'

export function UnauthorizedPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <GlassCard className="w-full max-w-md border-[var(--color-error)]/20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error)]/10">
          <ShieldAlert className="text-[var(--color-error)]" size={32} />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {t('unauthorized.title')}
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {t('unauthorized.message')}
        </p>
        <Link to="/" className="mt-6 inline-block">
          <GlassButton variant="primary" className="inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            {t('unauthorized.back')}
          </GlassButton>
        </Link>
      </GlassCard>
    </div>
  )
}
