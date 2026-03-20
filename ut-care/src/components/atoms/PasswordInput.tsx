import { forwardRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

/** Niveles de fortaleza: 0 = muy débil, 4 = muy fuerte */
function getPasswordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4
}

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Additional class for the wrapper (default wraps input + button) */
  wrapperClassName?: string
  /** Show password strength indicator below the input */
  showStrength?: boolean
}

const STRENGTH_KEYS = ['veryWeak', 'weak', 'medium', 'strong', 'veryStrong'] as const

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', wrapperClassName = '', showStrength = false, onKeyDown, onKeyUp, value, ...props }, ref) => {
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)
    const [capsLockOn, setCapsLockOn] = useState(false)
    const strValue = typeof value === 'string' ? value : ''

    const strength = useMemo(() => getPasswordStrength(strValue), [strValue])

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
      <div className={wrapperClassName}>
        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={`glass-input w-full px-4 py-2.5 pr-12 ${className}`}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            value={value}
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
        {showStrength && (
          <div className="mt-1.5 space-y-1" role="status" aria-live="polite">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      i <= strength
                        ? strength <= 1
                          ? 'var(--color-error, #ef4444)'
                          : strength <= 2
                            ? 'var(--color-warning, #f59e0b)'
                            : strength <= 3
                              ? 'var(--color-info, #3b82f6)'
                              : 'var(--color-success, #22c55e)'
                        : 'var(--border-color, rgba(0,0,0,0.1))',
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {t(`auth.passwordStrength.${STRENGTH_KEYS[strength]}`)}
            </p>
          </div>
        )}
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
