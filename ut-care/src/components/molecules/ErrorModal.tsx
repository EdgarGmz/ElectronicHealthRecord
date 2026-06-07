import { useTranslation } from 'react-i18next'
import { XCircle } from 'lucide-react'
import { GlassButton } from '@/components/atoms/GlassButton'

export interface ErrorModalProps {
  /** When true, the modal is visible */
  open: boolean
  /** Called when the user closes the modal (button or backdrop) */
  onClose: () => void
  /** Main message (e.g. error description, "Sesión expirada", "Sin permisos") */
  message?: string
  /** Optional title above the message */
  title?: string
  /** Label for the close button (default: auth.close) */
  closeLabel?: string
}

export function ErrorModal({
  open,
  onClose,
  message,
  title,
  closeLabel,
}: ErrorModalProps) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={title ? 'error-modal-title' : undefined}
      aria-describedby="error-modal-desc"
      onClick={onClose}
    >
      <div
        className="glass-card flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl px-8 py-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <XCircle
          size={64}
          className="modal-icon-error shrink-0 text-[var(--color-error)]"
          aria-hidden
        />
        <div className="flex flex-col items-center gap-1 text-center">
          {title && (
            <h2
              id="error-modal-title"
              className="text-lg font-semibold text-[var(--text-primary)]"
            >
              {title}
            </h2>
          )}
          <p id="error-modal-desc" className="text-sm text-[var(--text-secondary)]">
            {message ?? t('common.error')}
          </p>
        </div>
        <GlassButton
          type="button"
          variant="primary"
          className="min-w-[120px]"
          onClick={onClose}
        >
          {closeLabel ?? t('auth.close')}
        </GlassButton>
      </div>
    </div>
  )
}
