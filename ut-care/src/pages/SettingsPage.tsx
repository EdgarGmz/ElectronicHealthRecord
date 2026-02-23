import { useTranslation } from 'react-i18next'
import { GlassCard } from '@/components/atoms/GlassCard'
import { ThemeToggle } from '@/components/molecules/ThemeToggle'
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'

export function SettingsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('nav.settings')}</h1>
      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('theme.title')}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t('theme.autoSystem')} / {t('theme.autoShift')} / {t('theme.light')} / {t('theme.dark')}
        </p>
        <ThemeToggle />
      </GlassCard>
      <GlassCard>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('language.title')}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t('language.es')} / {t('language.en')}
        </p>
        <LanguageSwitcher />
      </GlassCard>
    </div>
  )
}
