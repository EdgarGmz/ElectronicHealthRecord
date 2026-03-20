/**
 * Formats a date into a human-readable string in Spanish
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateToSpanish(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
