import { useEffect, useState } from 'react'
import { Link, useBlocker } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Sun, Moon, Monitor, Clock, Languages, Type, List, PanelTop, Settings } from 'lucide-react'
import { GlassCard } from '@/components/atoms/GlassCard'
import { SuccessModal } from '@/components/molecules/SuccessModal'
import { useThemeStore, type ThemeMode } from '@/store/theme.store'
import { useFontSizeStore, type FontSizeMode } from '@/store/fontSize.store'
import { useTablePageSizeStore, TABLE_PAGE_SIZE_OPTIONS, type TablePageSize } from '@/store/tablePageSize.store'
import { useHeaderBarStore, HEADER_BAR_MODES, type HeaderBarMode } from '@/store/headerBar.store'
import {
  useStatusBarElementsStore,
  DATE_FORMAT_OPTIONS,
  type StatusBarDateFormat,
} from '@/store/statusBarElements.store'
import { useQuickSettingsStore } from '@/store/quickSettings.store'

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
  const quickSettings = useQuickSettingsStore()
  const currentLang = i18n.language.startsWith('es') ? 'es' : 'en'

  const [originalSettings, setOriginalSettings] = useState<SavedSettings | null>(null)
  const [success, setSuccess] = useState('')

  interface SavedSettings {
    themeMode: ThemeMode
    fontSizeMode: FontSizeMode
    tablePageSize: TablePageSize
    headerBarMode: HeaderBarMode
    statusBar: {
      showUserName: boolean
      showRole: boolean
      showTime: boolean
      showDate: boolean
      showTemperature: boolean
      showWeatherCondition: boolean
      showWeatherIcon: boolean
      showSettings: boolean
      dateFormat: StatusBarDateFormat
    }
    language: string
    quickSettings: {
      showTheme: boolean
      showLanguage: boolean
      showFontSize: boolean
      showHeaderBarMode: boolean
    }
  }

  useEffect(() => {
    const quickSettingsState = useQuickSettingsStore.getState()
    setOriginalSettings({
      themeMode: mode,
      fontSizeMode: fontSizeMode,
      tablePageSize: tablePageSize,
      headerBarMode: headerBarMode,
      statusBar: {
        showUserName: statusBarElements.showUserName,
        showRole: statusBarElements.showRole,
        showTime: statusBarElements.showTime,
        showDate: statusBarElements.showDate,
        showTemperature: statusBarElements.showTemperature,
        showWeatherCondition: statusBarElements.showWeatherCondition,
        showWeatherIcon: statusBarElements.showWeatherIcon,
        showSettings: statusBarElements.showSettings,
        dateFormat: statusBarElements.dateFormat,
      },
      language: currentLang,
      quickSettings: {
        showTheme: quickSettingsState.showTheme,
        showLanguage: quickSettingsState.showLanguage,
        showFontSize: quickSettingsState.showFontSize,
        showHeaderBarMode: quickSettingsState.showHeaderBarMode,
      },
    })
  }, [])

  const currentSettings: SavedSettings | null = originalSettings
    ? {
        themeMode: mode,
        fontSizeMode: fontSizeMode,
        tablePageSize: tablePageSize,
        headerBarMode: headerBarMode,
        statusBar: {
          showUserName: statusBarElements.showUserName,
          showRole: statusBarElements.showRole,
          showTime: statusBarElements.showTime,
          showDate: statusBarElements.showDate,
          showTemperature: statusBarElements.showTemperature,
          showWeatherCondition: statusBarElements.showWeatherCondition,
          showWeatherIcon: statusBarElements.showWeatherIcon,
          showSettings: statusBarElements.showSettings,
          dateFormat: statusBarElements.dateFormat,
        },
        language: currentLang,
        quickSettings: {
          showTheme: quickSettings.showTheme,
          showLanguage: quickSettings.showLanguage,
          showFontSize: quickSettings.showFontSize,
          showHeaderBarMode: quickSettings.showHeaderBarMode,
        },
      }
    : null

  const isDirty = originalSettings && currentSettings
    ? JSON.stringify(originalSettings) !== JSON.stringify(currentSettings)
    : false

  const handleSave = (proceedBlocker?: () => void) => {
    if (currentSettings) {
      setOriginalSettings(currentSettings)
      setSuccess(t('settings.saveSuccess', 'Los ajustes se han guardado con éxito.'))
      if (proceedBlocker) {
        setTimeout(() => {
          proceedBlocker()
        }, 800)
      }
    }
  }

  const handleRevert = () => {
    if (originalSettings) {
      useThemeStore.setState({ mode: originalSettings.themeMode })
      useThemeStore.getState().apply()

      useFontSizeStore.setState({ mode: originalSettings.fontSizeMode })
      useFontSizeStore.getState().apply()

      useTablePageSizeStore.setState({ defaultLimit: originalSettings.tablePageSize })

      useHeaderBarStore.setState({ mode: originalSettings.headerBarMode })

      useStatusBarElementsStore.setState({
        showUserName: originalSettings.statusBar.showUserName,
        showRole: originalSettings.statusBar.showRole,
        showTime: originalSettings.statusBar.showTime,
        showDate: originalSettings.statusBar.showDate,
        showTemperature: originalSettings.statusBar.showTemperature,
        showWeatherCondition: originalSettings.statusBar.showWeatherCondition,
        showWeatherIcon: originalSettings.statusBar.showWeatherIcon,
        showSettings: originalSettings.statusBar.showSettings,
        dateFormat: originalSettings.statusBar.dateFormat,
      })

      useQuickSettingsStore.setState({
        showTheme: originalSettings.quickSettings.showTheme,
        showLanguage: originalSettings.quickSettings.showLanguage,
        showFontSize: originalSettings.quickSettings.showFontSize,
        showHeaderBarMode: originalSettings.quickSettings.showHeaderBarMode,
      })

      i18n.changeLanguage(originalSettings.language)
    }
  }

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  )

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:underline"
        >
          <ArrowLeft size={18} />
          {t('nav.dashboard')}
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Settings className="text-[var(--color-primary)]" size={28} />
            {t('settings.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('settings.description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs text-[var(--color-error)] font-medium bg-[var(--color-error)]/10 px-3 py-1.5 rounded-full">
              {t('settings.pendingChangesAlert', 'Tienes cambios sin guardar')}
            </span>
          )}
          <button
            type="button"
            data-testid="save-settings-btn"
            disabled={!isDirty}
            onClick={() => handleSave()}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isDirty
                ? 'bg-[var(--color-primary)] text-white hover:brightness-110 active:scale-95'
                : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {t('settings.saveBtn', 'Guardar cambios')}
          </button>
        </div>
      </div>

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
                  aria-label={t(labelKey)}
                  aria-pressed={selected}
                  onClick={() => setHeaderBarMode(value as HeaderBarMode)}
                  className={`flex flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-[calc(33.33%-0.5rem)] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
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
                  checked={statusBarElements.showWeatherCondition}
                  onChange={(e) => statusBarElements.setShowWeatherCondition(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.showWeatherCondition')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={statusBarElements.showWeatherIcon}
                  onChange={(e) => statusBarElements.setShowWeatherIcon(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.showWeatherIcon')}
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

        {/* Quick Settings Configuration Card */}
        <GlassCard className="flex flex-col border-[var(--border)] shadow-lg transition-shadow hover:shadow-xl md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
              <Settings size={22} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('settings.quickSettingsTitle', 'Configuración de Ajustes Rápidos')}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {t('settings.quickSettingsDescription', 'Elige qué tipos de cambio deseas tener disponibles en el menú de acceso rápido (icono de engranaje ⚙️) en la barra de estado.')}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={quickSettings.showTheme}
                  onChange={(e) => quickSettings.setShowTheme(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('theme.title')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={quickSettings.showLanguage}
                  onChange={(e) => quickSettings.setShowLanguage(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('language.title')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={quickSettings.showFontSize}
                  onChange={(e) => quickSettings.setShowFontSize(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('fontSize.title')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={quickSettings.showHeaderBarMode}
                  onChange={(e) => quickSettings.setShowHeaderBarMode(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                {t('statusBar.title')}
              </label>
            </div>
          </div>
        </GlassCard>
      </div>

      {blocker.state === 'blocked' && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="unsaved-modal-title"
          aria-describedby="unsaved-modal-desc"
        >
          <div
            className="glass-card flex w-full max-w-md flex-col gap-6 rounded-2xl p-6 shadow-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center text-[var(--color-error)]">
                <Settings size={24} className="animate-spin-slow text-[var(--color-error)]" />
              </div>
              <h2
                id="unsaved-modal-title"
                className="text-lg font-bold text-[var(--text-primary)]"
              >
                {t('settings.unsavedModalTitle', '¿Desea salir sin guardar los cambios?')}
              </h2>
              <p
                id="unsaved-modal-desc"
                className="text-sm text-[var(--text-secondary)]"
              >
                {t('settings.unsavedModalDesc', 'Has realizado cambios en la configuración que se perderán si abandonas esta página.')}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                data-testid="modal-save-changes-btn"
                onClick={() => {
                  handleSave(() => blocker.proceed?.())
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-[var(--color-primary)] text-white hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                {t('settings.unsavedModalSave', 'Guardar cambios')}
              </button>
              <button
                type="button"
                data-testid="modal-exit-without-saving-btn"
                onClick={() => {
                  handleRevert()
                  setTimeout(() => {
                    blocker.proceed?.()
                  }, 10)
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10 active:scale-95 transition-all"
              >
                {t('settings.unsavedModalConfirmExit', 'Sí, salir sin guardar')}
              </button>
              <button
                type="button"
                data-testid="modal-cancel-btn"
                onClick={() => blocker.reset?.()}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
              >
                {t('settings.unsavedModalCancel', 'Cancelar')}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        open={!!success}
        message={success}
        onClose={() => setSuccess('')}
      />
    </div>
  )
}
