import { defineConfig, devices } from '@playwright/test'

/**
 * Prerrequisitos locales: PostgreSQL en `localhost:5432` (p. ej. `docker compose up -d db`),
 * migraciones y seed aplicados en `api/` (`npm run prisma:deploy && npm run prisma:seed`).
 * Playwright levanta la API (5000) y ut-care (5173) con `npm run dev`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // Debe ser "localhost" (no 127.0.0.1): en desarrollo la API solo permite CORS para localhost.
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // En local (macOS) usa el Chrome del sistema para evitar problemas de extracción
        // del Chromium for Testing en arm64. En CI se usa el Chromium headless normal.
        ...(process.env.CI ? {} : { channel: 'chrome' }),
      },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../api',
      url: 'http://localhost:5000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...process.env,
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
      },
    },
    {
      command: 'npm run dev -- --host localhost --port 5173',
      cwd: '../ut-care',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: 'http://127.0.0.1:5000',
      },
    },
  ],
})
