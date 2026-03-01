/**
 * Clases para filas de tabla: neutro o por contexto (éxito, atención, error).
 * Usar variante por contexto solo cuando la fila representa un estado (ej. completada, cancelada).
 */
const ROW_BASE = 'border-b border-[var(--border)] last:border-0'

export const TABLE_ROW = {
  success: `${ROW_BASE} bg-[var(--color-success)]/10 dark:bg-[var(--color-success)]/15 border-l-4 border-l-[var(--color-success)] hover:opacity-95`,
  warning: `${ROW_BASE} bg-[var(--color-warning)]/10 dark:bg-[var(--color-warning)]/15 border-l-4 border-l-[var(--color-warning)] hover:opacity-95`,
  error: `${ROW_BASE} bg-[var(--color-error)]/10 dark:bg-[var(--color-error)]/15 border-l-4 border-l-[var(--color-error)] hover:opacity-95`,
  default: `${ROW_BASE} hover:bg-black/5 dark:hover:bg-white/5`,
} as const

export type TableRowVariant = keyof typeof TABLE_ROW

export function getTableRowClass(variant: TableRowVariant = 'default'): string {
  return TABLE_ROW[variant] ?? TABLE_ROW.default
}

/** Clases para celdas/badges de estado (verde, amarillo, rojo según contexto). */
export const STATUS_BADGE = {
  success: 'rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--color-success)]/15 text-[var(--color-success)]',
  warning: 'rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
  error: 'rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--color-error)]/15 text-[var(--color-error)]',
} as const

export type StatusBadgeVariant = keyof typeof STATUS_BADGE

export function getStatusBadgeClass(variant: StatusBadgeVariant): string {
  return STATUS_BADGE[variant] ?? ''
}
