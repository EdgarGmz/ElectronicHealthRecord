import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Additional class for the wrapper (default wraps input + button) */
  wrapperClassName?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', wrapperClassName = '', ...props }, ref) => {
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)

    return (
      <div className={`relative ${wrapperClassName}`}>
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`glass-input w-full px-4 py-2.5 pr-12 ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-black/5 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 dark:hover:bg-white/10"
          aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
