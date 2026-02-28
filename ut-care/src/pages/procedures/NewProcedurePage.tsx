import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Stethoscope, Users } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { GlassButton } from '@/components/atoms/GlassButton'

export function NewProcedurePage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <Link to="/procedures" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={18} />
        {t('procedures.list')}
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('procedures.newProcedure')}</h1>
      <GlassCard className="border-[var(--color-primary)]/20">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
            <Stethoscope className="text-[var(--color-primary)]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[var(--text-secondary)]">{t('procedures.newProcedureFromConsultation')}</p>
            <Link to="/patients" className="mt-4 inline-block">
              <GlassButton variant="primary" className="inline-flex items-center gap-2">
                <Users size={18} />
                {t('procedures.goToPatients')}
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
