import { useTranslation } from 'react-i18next'
import { FileQuestion } from 'lucide-react'
import { GlassButton } from '@/components/atoms/GlassButton'

export type ExportFormat = 'excel' | 'pdf'

export interface ConfirmExportModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  format: ExportFormat
}

export function ConfirmExportModal({
  open,
  onClose,
  onConfirm,
  format,
}: ConfirmExportModalProps) {
  const { t } = useTranslation()
  const formatLabel = format === 'excel' ? t('reports.formatExcel') : t('reports.formatPdf')

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-export-title"
      aria-describedby="confirm-export-desc"
      onClick={onClose}
    >
      <div
        className="glass-card flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl px-8 py-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <FileQuestion
          size={56}
          className="shrink-0 text-[var(--color-primary)]"
          aria-hidden
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <h2
            id="confirm-export-title"
            className="text-lg font-semibold text-[var(--text-primary)]"
          >
            {t('reports.confirmExportTitle')}
          </h2>
          <p id="confirm-export-desc" className="text-sm text-[var(--text-secondary)]">
            {t('reports.confirmExportMessage', { format: formatLabel })}
          </p>
        </div>
        <div className="flex gap-3 w-full justify-center">
          <GlassButton type="button" onClick={onClose}>
            {t('common.cancel')}
          </GlassButton>
          <GlassButton type="button" variant="primary" onClick={onConfirm}>
            {t('common.confirm')}
          </GlassButton>
        </div>
      </div>
    </div>
  )
}
