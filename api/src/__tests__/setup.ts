/**
 * @file setup.ts
 * @description Archivo de configuración global que Jest ejecuta antes de cada suite de pruebas.
 *
 * - Establece NODE_ENV=test para que el logger de winston active su modo `silent`,
 *   eliminando todo el ruido de [info]/[warn]/[error] en la salida de `npm test`.
 * - Este archivo se ejecuta en el proceso de Node antes de importar cualquier módulo,
 *   por lo que la variable de entorno ya está disponible cuando logger.ts se inicializa.
 */
process.env.NODE_ENV = 'test';
