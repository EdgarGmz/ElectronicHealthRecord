import { forwardRef, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Additional class for the wrapper (default wraps input + button) */
  wrapperClassName?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', wrapperClassName = '', onKeyDown, onKeyUp, ...props }, ref) => {
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)
    const [capsLockOn, setCapsLockOn] = useState(false)

    useEffect(() => {
      const syncCapsLock = (e: KeyboardEvent) => {
        if (e.key === 'CapsLock') {
          setCapsLockOn(e.getModifierState('CapsLock'))
        }
      }
      window.addEventListener('keydown', syncCapsLock)
      window.addEventListener('keyup', syncCapsLock)
      return () => {
        window.removeEventListener('keydown', syncCapsLock)
        window.removeEventListener('keyup', syncCapsLock)
      }
    }, [])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        setCapsLockOn(e.getModifierState('CapsLock'))
        onKeyDown?.(e)
      },
      [onKeyDown]
    )
    const handleKeyUp = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        setCapsLockOn(e.getModifierState('CapsLock'))
        onKeyUp?.(e)
      },
      [onKeyUp]
    )

    return (
      <div className={`relative ${wrapperClassName}`}>
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`glass-input w-full px-4 py-2.5 pr-12 ${className}`}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
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
        {capsLockOn && (
          <p
            className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-warning)]"
            role="status"
            aria-live="polite"
          >
            <AlertCircle size={14} aria-hidden />
            {t('auth.capsLockOn')}
          </p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
