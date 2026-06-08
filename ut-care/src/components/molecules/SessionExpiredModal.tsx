import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { GlassButton } from '@/components/atoms/GlassButton'

export interface SessionExpiredModalProps {
  open: boolean
  onConfirm: () => void
}

export function SessionExpiredModal({ open, onConfirm }: SessionExpiredModalProps) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!open) return

    setCountdown(10)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onConfirm()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, onConfirm])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-desc"
    >
      <div
        className="glass-card flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl px-8 py-8 shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full bg-[var(--color-primary)]/10 animate-ping" />
          <div className="relative w-14 h-14 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center text-[var(--color-primary)]">
            <Clock size={28} className="animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2
            id="session-expired-title"
            className="text-lg font-semibold text-[var(--text-primary)]"
          >
            Sesión Expirada
          </h2>
          <p id="session-expired-desc" className="text-sm text-[var(--text-secondary)]">
            Tu sesión ha expirado por inactividad o seguridad. Por favor, vuelve a iniciar sesión.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Redirección automática en <span className="font-semibold text-[var(--color-primary)]">{countdown}</span> segundos...
          </p>
        </div>
        <GlassButton
          type="button"
          variant="primary"
          className="w-full py-2.5 font-medium flex items-center justify-center gap-2"
          onClick={onConfirm}
        >
          Reiniciar Sesión
        </GlassButton>
      </div>
    </div>
  )
}
