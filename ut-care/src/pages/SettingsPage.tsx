import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings as SettingsIcon, ArrowLeft, Sun, Moon, Monitor, Clock, Languages, Type } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { useThemeStore, type ThemeMode } from '@/store/theme.store'
import { useFontSizeStore, type FontSizeMode } from '@/store/fontSize.store'

const THEME_OPTIONS: { value: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'auto-shift', icon: Clock, labelKey: 'theme.autoShift' },
  { value: 'auto-system', icon: Monitor, labelKey: 'theme.autoSystem' },
]

const FONT_SIZE_OPTIONS: FontSizeMode[] = ['small', 'medium', 'large']

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { mode, setMode } = useThemeStore()
  const { mode: fontSizeMode, setMode: setFontSizeMode } = useFontSizeStore()
  const currentLang = i18n.language.startsWith('es') ? 'es' : 'en'

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
      >
        <ArrowLeft size={18} />
        {t('nav.dashboard')}
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <SettingsIcon size={22} />
          </span>
          {t('nav.settings')}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl">
          {t('help.settings')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Sun size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('theme.title')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('theme.light')}, {t('theme.dark')}, {t('theme.autoShift')}, {t('theme.autoSystem')}
              </p>
            </div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 rounded-xl bg-black/5 p-1.5 dark:bg-white/5">
            {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
              <button
                key={value}
                type="button"
                aria-label={t(labelKey)}
                onClick={() => setMode(value)}
                className={`flex flex-1 min-w-[calc(50%-0.25rem)] items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  mode === value
                    ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {t(labelKey)}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Languages size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('language.title')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('language.es')} / {t('language.en')}
              </p>
            </div>
          </div>
          <div className="mt-auto flex rounded-xl bg-black/5 p-1.5 dark:bg-white/5">
            <button
              type="button"
              aria-label={t('language.es')}
              onClick={() => i18n.changeLanguage('es')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                currentLang === 'es'
                  ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
              }`}
            >
              {t('language.es')}
            </button>
            <button
              type="button"
              aria-label={t('language.en')}
              onClick={() => i18n.changeLanguage('en')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                currentLang === 'en'
                  ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
              }`}
            >
              {t('language.en')}
            </button>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Type size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('fontSize.title')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('fontSize.small')}, {t('fontSize.medium')}, {t('fontSize.large')}
              </p>
            </div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 rounded-xl bg-black/5 p-1.5 dark:bg-white/5">
            {FONT_SIZE_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={t(`fontSize.${value}`)}
                onClick={() => setFontSizeMode(value)}
                className={`flex flex-1 min-w-[calc(33.333%-0.334rem)] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  fontSizeMode === value
                    ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                }`}
              >
                {t(`fontSize.${value}`)}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
