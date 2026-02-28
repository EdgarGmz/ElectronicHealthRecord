import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor, Clock } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/store/theme.store'

const options: { value: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'auto-shift', icon: Clock, labelKey: 'theme.autoShift' },
  { value: 'auto-system', icon: Monitor, labelKey: 'theme.autoSystem' },
]

export function ThemeToggle() {
  const { t } = useTranslation()
  const { mode, setMode } = useThemeStore()

  return (
    <div className="flex items-center gap-1 glass-card p-1.5">
      {options.map(({ value, icon: Icon, labelKey }) => (
        <button
          key={value}
          type="button"
          aria-label={t(labelKey)}
          onClick={() => setMode(value)}
          className={`rounded-lg p-2 transition-all ${
            mode === value
              ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
              : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  )
}
