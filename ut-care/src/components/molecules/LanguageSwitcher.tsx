import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const toggle = () => {
    const next = i18n.language.startsWith('es') ? 'en' : 'es'
    i18n.changeLanguage(next)
  }

  return (
    <button
      type="button"
      aria-label={t('language.title')}
      onClick={toggle}
      className="glass-button inline-flex items-center gap-2 px-3 py-2"
    >
      <Languages size={18} />
      <span className="text-sm font-medium">{i18n.language.startsWith('es') ? t('language.en') : t('language.es')}</span>
    </button>
  )
}
