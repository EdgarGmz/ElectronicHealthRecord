import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'

export function NewSessionPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <Link to="/sessions" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('sessions.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('sessions.newSession')}</h1>
      <GlassCard>
        <p className="text-[var(--text-secondary)]">Formulario de nueva sesión de terapia en construcción.</p>
      </GlassCard>
    </div>
  )
}
