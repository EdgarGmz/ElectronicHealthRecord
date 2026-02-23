import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { HelpCircle, LayoutDashboard, Users, Calendar, User, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'

export function HelpPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
        <HelpCircle size={28} />
        {t('help.title')}
      </h1>

      <p className="text-[var(--text-secondary)] max-w-2xl">{t('help.intro')}</p>

      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('help.whatYouCanDo')}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{t('help.modulesIntro')}</p>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li><strong className="text-[var(--text-primary)]">{t('nav.dashboard')}:</strong> {t('help.dashboard')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.patients')}:</strong> {t('help.patients')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.appointments')}:</strong> {t('help.appointments')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.sessions')}:</strong> {t('help.sessions')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.medications')}:</strong> {t('help.medications')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.procedures')}:</strong> {t('help.procedures')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.interconsultations')}:</strong> {t('help.interconsultations')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.reports')}:</strong> {t('help.reports')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.evaluations')}:</strong> {t('help.evaluations')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.notifications')}:</strong> {t('help.notifications')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.profile')}:</strong> {t('help.profile')}</li>
          <li><strong className="text-[var(--text-primary)]">{t('nav.settings')}:</strong> {t('help.settings')}</li>
        </ul>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('help.quickLinks')}</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <LayoutDashboard size={18} />
            {t('help.goToDashboard')}
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <Users size={18} />
            {t('help.goToPatients')}
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <Calendar size={18} />
            {t('help.goToAppointments')}
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
          >
            <User size={18} />
            {t('help.goToProfile')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('help.needMore')}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{t('help.contactSupport')}</p>
      </GlassCard>
    </div>
  )
}
