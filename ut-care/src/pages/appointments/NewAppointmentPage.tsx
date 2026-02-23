import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'

export function NewAppointmentPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <Link to="/appointments" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('appointments.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('appointments.newAppointment')}</h1>
      <GlassCard>
        <p className="text-[var(--text-secondary)]">Formulario de nueva cita en construcción.</p>
      </GlassCard>
    </div>
  )
}
