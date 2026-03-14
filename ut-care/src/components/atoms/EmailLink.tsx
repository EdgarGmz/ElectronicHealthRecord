interface EmailLinkProps {
  email: string
  className?: string
  children?: React.ReactNode
}

/** Enlace mailto para abrir el cliente de correo. */
export function EmailLink({ email, className = '', children }: EmailLinkProps) {
  if (!email?.trim()) return null
  const href = `mailto:${email.trim()}`
  return (
    <a
      href={href}
      className={`text-[var(--color-primary)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded ${className}`}
    >
      {children ?? email}
    </a>
  )
}
