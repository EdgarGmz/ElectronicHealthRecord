import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'
import { GlassButton } from '@/components/atoms/GlassButton'

export interface SuccessModalProps {
  /** When true, the modal is visible */
  open: boolean
  /** Called when the user closes the modal (button or backdrop) */
  onClose: () => void
  /** Main message (e.g. "Datos guardados correctamente") */
  message?: string
  /** Optional title above the message */
  title?: string
  /** Label for the close button (default: common.close) */
  closeLabel?: string
}

export function SuccessModal({
  open,
  onClose,
  message,
  title,
  closeLabel,
}: SuccessModalProps) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'success-modal-title' : undefined}
      aria-describedby="success-modal-desc"
      onClick={onClose}
    >
      <div
        className="glass-card flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl px-8 py-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckCircle
          size={64}
          className="modal-icon-success shrink-0 text-[var(--color-success)]"
          aria-hidden
        />
        <div className="flex flex-col items-center gap-1 text-center">
          {title && (
            <h2
              id="success-modal-title"
              className="text-lg font-semibold text-[var(--text-primary)]"
            >
              {title}
            </h2>
          )}
          <p id="success-modal-desc" className="text-sm text-[var(--text-secondary)]">
            {message ?? t('common.success')}
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
