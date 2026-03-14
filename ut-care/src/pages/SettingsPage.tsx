import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings as SettingsIcon, ArrowLeft, Sun, Moon, Monitor, Clock, Languages, Type, List, PanelTop } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { useThemeStore, type ThemeMode } from '@/store/theme.store'
import { useFontSizeStore, type FontSizeMode } from '@/store/fontSize.store'
import { useTablePageSizeStore, TABLE_PAGE_SIZE_OPTIONS, type TablePageSize } from '@/store/tablePageSize.store'
import { useHeaderBarStore, HEADER_BAR_MODES, type HeaderBarMode } from '@/store/headerBar.store'
import {
  useStatusBarElementsStore,
  DATE_FORMAT_OPTIONS,
  type StatusBarDateFormat,
} from '@/store/statusBarElements.store'

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
  const { defaultLimit: tablePageSize, setDefaultLimit: setTablePageSize } = useTablePageSizeStore()
  const { mode: headerBarMode, setMode: setHeaderBarMode } = useHeaderBarStore()
  const statusBarElements = useStatusBarElementsStore()
  const currentLang = i18n.language.startsWith('es') ? 'es' : 'en'

  return (
    <div className="mx-auto flex min-h-0 max-w-4xl flex-col items-center px-2 py-4 sm:px-4">
      <div className="w-full space-y-8">
        <header className="flex flex-col items-center text-center">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 self-center text-[var(--color-primary)] transition-colors hover:underline"
          >
            <ArrowLeft size={18} />
            {t('nav.dashboard')}
          </Link>
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] shadow-sm">
              <SettingsIcon size={26} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {t('nav.settings')}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t('help.settings')}
              </p>
            </div>
          </div>
        </header>

        <div className="grid w-full gap-6 md:grid-cols-2">
          <GlassCard className="flex flex-col border-[var(--border)] shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <Sun size={22} />
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

          <GlassCard className="flex flex-col border-[var(--border)] shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <Languages size={22} />
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

          <GlassCard className="flex flex-col border-[var(--border)] shadow-lg transition-shadow hover:shadow-xl md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <Type size={22} />
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

          <GlassCard className="flex flex-col border-[var(--border)] shadow-lg transition-shadow hover:shadow-xl md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <List size={22} />
              </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('tablePageSize.title')}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('tablePageSize.description')}
              </p>
            </div>
          </div>
          <div className="mt-auto flex flex-nowrap gap-2 rounded-xl bg-black/5 p-1.5 dark:bg-white/5">
            {TABLE_PAGE_SIZE_OPTIONS.map((value) => {
              const selected = tablePageSize === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={String(value)}
                  aria-pressed={selected}
                  onClick={() => setTablePageSize(value as TablePageSize)}
                  className={`flex flex-1 min-w-0 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                  }`}
                >
                  {selected ? (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-transparent dark:ring-offset-[var(--bg-primary)]">
                      {value}
                    </span>
                  ) : (
                    value
                  )}
                </button>
              )
            })}
          </div>
        </GlassCard>

          <GlassCard className="flex flex-col border-[var(--border)] shadow-lg transition-shadow hover:shadow-xl md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <PanelTop size={22} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {t('statusBar.title')}
                </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('statusBar.description')}
              </p>
            </div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2 rounded-xl bg-black/5 p-1.5 dark:bg-white/5">
            {HEADER_BAR_MODES.map((value) => {
              const selected = headerBarMode === value
              const labelKey = value === 'always' ? 'statusBar.alwaysVisible' : 'statusBar.hideOnScroll'
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={t(labelKey)}
                  aria-pressed={selected}
                  onClick={() => setHeaderBarMode(value as HeaderBarMode)}
                  className={`flex flex-1 min-w-[calc(50%-0.25rem)] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                  }`}
                >
                  {t(labelKey)}
                </button>
              )
            })}
          </div>
        </GlassCard>

          <GlassCard className="flex flex-col border-[var(--border)] shadow-lg transition-shadow hover:shadow-xl md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <PanelTop size={22} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {t('statusBar.elementsTitle')}
                </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {t('statusBar.elementsDescription')}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={statusBarElements.showUserName}
                  onChange={(e) => statusBarElements.setShowUserName(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.showUserName')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={statusBarElements.showRole}
                  onChange={(e) => statusBarElements.setShowRole(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.showRole')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={statusBarElements.showTime}
                  onChange={(e) => statusBarElements.setShowTime(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.showTime')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={statusBarElements.showDate}
                  onChange={(e) => statusBarElements.setShowDate(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.showDate')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={statusBarElements.showTemperature}
                  onChange={(e) => statusBarElements.setShowTemperature(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.showTemperature')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={statusBarElements.showSettings}
                  onChange={(e) => statusBarElements.setShowSettings(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.showSettings')}
              </label>
            </div>
            <div className="flex flex-col items-center">
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                {t('statusBar.dateFormat')}
              </label>
              <div className="flex flex-wrap justify-center gap-2 rounded-xl bg-black/5 p-1.5 dark:bg-white/5">
                {DATE_FORMAT_OPTIONS.map((value) => {
                  const labelKey =
                    value === 'short'
                      ? 'statusBar.dateFormatShort'
                      : value === 'medium'
                        ? 'statusBar.dateFormatMedium'
                        : 'statusBar.dateFormatLong'
                  const selected = statusBarElements.dateFormat === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => statusBarElements.setDateFormat(value as StatusBarDateFormat)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                      }`}
                    >
                      {t(labelKey)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </GlassCard>
        </div>
      </div>
    </div>
  )
}
