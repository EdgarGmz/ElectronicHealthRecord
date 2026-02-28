import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'glass' | 'primary'
  className?: string
}

export function GlassButton({
  children,
  variant = 'glass',
  className = '',
  ...props
}: GlassButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50'
  const styles =
    variant === 'primary'
      ? 'bg-[var(--color-primary)] text-white hover:opacity-90 focus-visible:ring-[var(--color-primary)]'
      : 'glass-button'
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}
