import { type ReactNode, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { HelpCircle } from 'lucide-react'
import { GlassButton } from '@/components/atoms/GlassButton'

export interface ConfirmModalProps {
  /** When true, the modal is visible */
  open: boolean
  /** Called when the user cancels (button or backdrop) */
  onClose: () => void
  /** Called when the user confirms the action */
  onConfirm: () => void
  /** Modal title (e.g. "Confirmar eliminación", "Guardar cambios") */
  title: string
  /** Main message or description */
  message: string
  /** Optional detail content (e.g. list of changes, extra warning) */
  detail?: ReactNode
  /** Label for the confirm button (default: common.confirm) */
  confirmLabel?: string
  /** Label for the cancel button (default: common.cancel) */
  cancelLabel?: string
  /** When 'danger', confirm button uses error style (e.g. for delete) */
  variant?: 'default' | 'danger'
  /** Disable confirm button while action is in progress */
  confirming?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  detail,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  confirming = false,
}: ConfirmModalProps) {
  const { t } = useTranslation()
  if (!open) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onConfirm()
  }

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="glass-card flex w-full max-w-md flex-col items-center gap-5 rounded-2xl px-8 py-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal-icon-wrapper">
          <HelpCircle
            size={56}
            className="confirm-modal-icon shrink-0 text-[var(--color-primary)]"
            aria-hidden
          />
        </div>
        <div className="flex flex-col items-center gap-1 text-center w-full">
          <h2
            id="confirm-modal-title"
            className="text-lg font-semibold text-[var(--text-primary)]"
          >
            {title}
          </h2>
          <p id="confirm-modal-desc" className="text-sm text-[var(--text-secondary)]">
            {message}
          </p>
          {detail && (
            <div className="mt-3 w-full rounded-xl border border-[var(--border)] bg-black/5 px-4 py-3 text-left text-sm text-[var(--text-secondary)] dark:bg-white/5">
              {detail}
            </div>
          )}
        </div>
        <div className="flex w-full gap-3 justify-center">
          <GlassButton type="button" onClick={onClose} disabled={confirming}>
            {cancelLabel ?? t('common.cancel')}
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            disabled={confirming}
            className={variant === 'danger' ? '!bg-[var(--color-error)] hover:!opacity-90' : ''}
          >
            {confirming ? '…' : (confirmLabel ?? t('common.confirm'))}
          </GlassButton>
        </div>
      </form>
    </div>
  )

  return createPortal(modal, document.body)
}
