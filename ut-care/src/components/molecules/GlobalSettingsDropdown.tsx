import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Sun, Moon, Clock, Monitor, Languages, Type, PanelTop } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/store/theme.store'
import { useFontSizeStore } from '@/store/fontSize.store'
import { useHeaderBarStore } from '@/store/headerBar.store'
import { useQuickSettingsStore } from '@/store/quickSettings.store'

const THEME_OPTIONS: { value: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'auto-shift', icon: Clock, labelKey: 'theme.autoShift' },
  { value: 'auto-system', icon: Monitor, labelKey: 'theme.autoSystem' },
]

export function GlobalSettingsDropdown() {
  const { t, i18n } = useTranslation()
  const { mode, setMode } = useThemeStore()
  const { mode: fontSizeMode, setMode: setFontSizeMode } = useFontSizeStore()
  const { mode: headerBarMode, setMode: setHeaderBarMode } = useHeaderBarStore()
  const { showTheme, showLanguage, showFontSize, showHeaderBarMode } = useQuickSettingsStore()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentLang = i18n.language.startsWith('es') ? 'es' : 'en'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  const setTheme = (value: ThemeMode) => {
    setMode(value)
  }

  const setLanguage = (lang: 'es' | 'en') => {
    i18n.changeLanguage(lang)
  }

  // Count active sections to apply correct layout/spacing
  const activeSectionsCount = [showTheme, showLanguage, showFontSize, showHeaderBarMode].filter(Boolean).length

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('nav.settings')}
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-all duration-300 hover:bg-black/5 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] dark:hover:bg-white/10 ${
          open ? 'rotate-90 text-[var(--text-primary)] bg-black/5 dark:bg-white/10' : ''
        }`}
      >
        <Settings size={22} className="transition-transform duration-300" />
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[var(--border)] bg-[var(--glass-bg)] p-4 shadow-lg backdrop-blur-xl transition-all duration-200 origin-top-right ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
        }`}
        role="dialog"
        aria-label={t('nav.settings')}
      >
        {activeSectionsCount === 0 ? (
          <p className="text-xs text-[var(--text-muted)] text-center py-2">
            {t('settings.quickSettingsEmpty', 'No hay ajustes rápidos habilitados')}
          </p>
        ) : (
          <div className="space-y-4">
            {/* Theme toggle */}
            {showTheme && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <Sun size={16} className="text-[var(--color-primary)]" />
                  {t('theme.title')}
                </p>
                <div className="flex flex-col gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/5">
                  {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left ${
                        mode === value
                          ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{t(labelKey)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language toggle */}
            {showLanguage && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <Languages size={16} className="text-[var(--color-primary)]" />
                  {t('language.title')}
                </p>
                <div className="flex rounded-lg bg-black/5 p-1 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setLanguage('es')}
                    className={`flex flex-1 items-center justify-center rounded-md py-2 text-sm font-medium transition-colors ${
                      currentLang === 'es'
                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                    }`}
                  >
                    {t('language.es')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`flex flex-1 items-center justify-center rounded-md py-2 text-sm font-medium transition-colors ${
                      currentLang === 'en'
                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                    }`}
                  >
                    {t('language.en')}
                  </button>
                </div>
              </div>
            )}

            {/* Font size toggle */}
            {showFontSize && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <Type size={16} className="text-[var(--color-primary)]" />
                  {t('fontSize.title')}
                </p>
                <div className="flex rounded-lg bg-black/5 p-1 dark:bg-white/5">
                  {(['small', 'medium', 'large'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFontSizeMode(value)}
                      className={`flex flex-1 items-center justify-center rounded-md py-2 text-xs font-medium transition-colors ${
                        fontSizeMode === value
                          ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                      }`}
                    >
                      {t(`fontSize.${value}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Header bar visibility mode toggle */}
            {showHeaderBarMode && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <PanelTop size={16} className="text-[var(--color-primary)]" />
                  {t('statusBar.title')}
                </p>
                <div className="flex flex-col gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/5">
                  {(['always', 'always-hidden', 'hide-on-scroll'] as const).map((value) => {
                    const labelKey =
                      value === 'always'
                        ? 'statusBar.alwaysVisible'
                        : value === 'always-hidden'
                        ? 'statusBar.alwaysHidden'
                        : 'statusBar.hideOnScroll'
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setHeaderBarMode(value)}
                        className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left ${
                          headerBarMode === value
                            ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5'
                        }`}
                      >
                        <span>{t(labelKey)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
