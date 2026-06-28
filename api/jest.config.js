module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      diagnostics: false,
    }],
  },

  // ── Cobertura ─────────────────────────────────────────────────────────────
  // Archivos que se miden al correr `npm run test:coverage`
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',          // Punto de entrada (solo bootstrapping)
    '!src/lambda.ts',         // Adaptador AWS Lambda
    '!src/__tests__/**',      // Los propios tests no se cuentan
    '!src/scripts/**',        // Scripts de administración one-shot
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Umbrales mínimos de cobertura — el build CI falla si caen por debajo
  // Fase 1: umbral conservador. Aumentar a 70% al completar Fase 3.
  coverageThreshold: {
    global: {
      lines:      60,
      functions:  60,
      branches:   50,
      statements: 60,
    },
  },

  // ── Tiempo de espera ──────────────────────────────────────────────────────
  // 15s para tests de integración que usan Prisma/DB real
  testTimeout: 15000,

  // ── Variables de entorno para tests ──────────────────────────────────────
  // Establece NODE_ENV=test antes de cada suite para silenciar el logger de winston
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
};
