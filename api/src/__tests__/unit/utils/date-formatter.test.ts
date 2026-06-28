/**
 * @file date-formatter.test.ts
 * @description Pruebas unitarias para formatDateToSpanish.
 *
 * Estrategia: Black-box sobre el contrato público de la función.
 *   - La función debe retornar un string no vacío.
 *   - El resultado debe contener el año numérico correcto.
 *   - El día de la semana debe estar en español (usando Intl/locale es-ES).
 *   - Fechas especiales: inicio de año, fin de año, día bisiesto.
 */

import { formatDateToSpanish } from '../../../utils/date-formatter';

describe('formatDateToSpanish', () => {
  it('debe retornar un string no vacío para cualquier fecha válida', () => {
    const result = formatDateToSpanish(new Date());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('debe incluir el año correcto en el resultado', () => {
    const date = new Date('2024-07-15T10:30:00');
    const result = formatDateToSpanish(date);
    expect(result).toContain('2024');
  });

  it('debe incluir el nombre del mes en español', () => {
    // 15 de julio → "julio"
    const date = new Date('2024-07-15T10:00:00');
    const result = formatDateToSpanish(date);
    expect(result.toLowerCase()).toContain('julio');
  });

  it('debe incluir el día de la semana en español (lunes)', () => {
    // 15 de julio de 2024 es lunes
    const date = new Date('2024-07-15T08:00:00');
    const result = formatDateToSpanish(date);
    expect(result.toLowerCase()).toContain('lunes');
  });

  it('debe manejar correctamente el 1 de enero (inicio de año)', () => {
    const date = new Date('2024-01-01T00:00:00');
    const result = formatDateToSpanish(date);
    expect(result).toContain('2024');
    expect(result.toLowerCase()).toContain('enero');
  });

  it('debe manejar correctamente el 31 de diciembre (fin de año)', () => {
    const date = new Date('2024-12-31T23:59:00');
    const result = formatDateToSpanish(date);
    expect(result).toContain('2024');
    expect(result.toLowerCase()).toContain('diciembre');
  });

  it('debe manejar el 29 de febrero de año bisiesto sin errores', () => {
    // 2024 es bisiesto
    const date = new Date('2024-02-29T12:00:00');
    const result = formatDateToSpanish(date);
    expect(result).toContain('2024');
    expect(result.toLowerCase()).toContain('febrero');
  });
});
