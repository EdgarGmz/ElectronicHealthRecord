import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

export interface LoadingModalProps {
  /** When true, the modal is visible */
  open: boolean
  /** Optional message below the spinner (default: common.loading) */
  message?: string
}

export function LoadingModal({ open, message }: LoadingModalProps) {
  const { t } = useTranslation()

  if (!open) return null

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={message ?? t('common.loading')}
    >
      <div
        className="glass-card flex flex-col items-center gap-4 rounded-2xl px-8 py-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Loader2
          size={48}
          className="shrink-0 animate-spin text-[var(--color-primary)]"
          aria-hidden
        />
        <p className="text-center text-sm font-medium text-[var(--text-primary)]">
          {message ?? t('common.loading')}
        </p>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
