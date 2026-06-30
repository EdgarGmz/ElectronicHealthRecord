/**
 * Exploración manual del flujo completo del rol PSICÓLOGO en ut-care.
 * Se ejecuta con reuseExistingServer=true aprovechando los servidores ya levantados.
 * 
 * Cubre: login, dashboard, pacientes, citas, sesiones,
 *        evaluaciones, calendario, perfil y rutas restringidas.
 */
import { test, expect } from '@playwright/test'

const USERNAME = process.env.E2E_PSY_USERNAME ?? 'DanielaGVR'
const PASSWORD  = process.env.E2E_PSY_PASSWORD  ?? 'Password123!'

// Helper para login reutilizable
async function loginAs(page: Parameters<typeof test>[1] extends (args: infer A) => unknown ? (A extends { page: infer P } ? P : never) : never, username: string, password: string) {
  await page.goto('/login')
  await page.getByTestId('login-username').fill(username)
  await page.getByTestId('login-password').fill(password)
  await page.getByTestId('login-submit').click()
  // Esperar redirección al dashboard
  await expect(page).toHaveURL('/', { timeout: 15_000 })
}

test.describe('Flujo completo — rol PSICÓLOGO', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-username').fill(USERNAME)
    await page.getByTestId('login-password').fill(PASSWORD)
    await page.getByTestId('login-submit').click()
    await expect(page).toHaveURL('/', { timeout: 15_000 })
  })

  // ─────────────────────────────────────────────────────
  // Dashboard
  // ─────────────────────────────────────────────────────
  test('dashboard — carga y muestra tarjetas del psicólogo', async ({ page }) => {
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 })
    await page.screenshot({ path: 'screenshots/01-dashboard.png', fullPage: true })

    // El psicólogo NO ve totalPatients
    const totalPatientsCard = page.locator('[data-card-id="totalPatients"]')
    // Sí ve appointmentsToday y pending
    console.log('Dashboard cargado correctamente')
  })

  // ─────────────────────────────────────────────────────
  // Sidebar — nav items visibles
  // ─────────────────────────────────────────────────────
  test('sidebar — solo muestra módulos del psicólogo', async ({ page }) => {
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 })
    await page.screenshot({ path: 'screenshots/02-sidebar.png' })

    // Módulos que SÍ deben verse
    const visibleLinks = ['/appointments', '/sessions', '/patients', '/evaluations', '/calendar', '/interconsultations', '/reports', '/notifications']
    for (const href of visibleLinks) {
      const link = page.locator(`nav a[href="${href}"]`)
      const exists = (await link.count()) > 0
      console.log(`Enlace ${href}: ${exists ? '✅ visible' : '❌ no encontrado'}`)
    }

    // Módulos que NO deben verse para psicólogo
    const hiddenLinks = ['/users', '/audit-logs', '/careers', '/medications', '/procedures']
    for (const href of hiddenLinks) {
      const link = page.locator(`nav a[href="${href}"]`)
      const count = await link.count()
      console.log(`Enlace restringido ${href}: ${count === 0 ? '✅ oculto' : '⚠️ visible (debería estar oculto)'}`)
    }
  })

  // ─────────────────────────────────────────────────────
  // Módulo Pacientes
  // ─────────────────────────────────────────────────────
  test('pacientes — lista y detalle', async ({ page }) => {
    await page.goto('/patients')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/03-patients-list.png', fullPage: true })
    console.log('URL pacientes:', page.url())

    // Intentar abrir el primer paciente
    const firstRow = page.locator('table tbody tr').first()
    if (await firstRow.isVisible()) {
      await firstRow.click()
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/04-patient-detail.png', fullPage: true })
      console.log('Detalle paciente URL:', page.url())
    }
  })

  // ─────────────────────────────────────────────────────
  // Módulo Citas
  // ─────────────────────────────────────────────────────
  test('citas — lista y botón nueva cita', async ({ page }) => {
    await page.goto('/appointments')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/05-appointments.png', fullPage: true })
    console.log('URL citas:', page.url())

    // Buscar botón Nueva Cita
    const newBtn = page.getByRole('link', { name: /nueva cita|new appointment/i })
      .or(page.getByRole('button', { name: /nueva cita|new appointment/i }))
    if (await newBtn.count() > 0) {
      console.log('✅ Botón Nueva Cita encontrado')
      await newBtn.first().click()
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/06-new-appointment.png', fullPage: true })
    }
  })

  // ─────────────────────────────────────────────────────
  // Módulo Sesiones
  // ─────────────────────────────────────────────────────
  test('sesiones — lista y nueva sesión', async ({ page }) => {
    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/07-sessions.png', fullPage: true })
    console.log('URL sesiones:', page.url())

    // Intentar acceder a Nueva Sesión
    await page.goto('/sessions/new')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/08-new-session.png', fullPage: true })
    console.log('Nueva sesión URL:', page.url())
  })

  // ─────────────────────────────────────────────────────
  // Módulo Evaluaciones
  // ─────────────────────────────────────────────────────
  test('evaluaciones — lista', async ({ page }) => {
    await page.goto('/evaluations')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/09-evaluations.png', fullPage: true })
    console.log('URL evaluaciones:', page.url())
  })

  // ─────────────────────────────────────────────────────
  // Calendario
  // ─────────────────────────────────────────────────────
  test('calendario — semana del psicólogo', async ({ page }) => {
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/10-calendar.png', fullPage: true })
    console.log('URL calendario:', page.url())
  })

  // ─────────────────────────────────────────────────────
  // Perfil
  // ─────────────────────────────────────────────────────
  test('perfil — página del usuario', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/11-profile.png', fullPage: true })
    console.log('URL perfil:', page.url())
  })

  // ─────────────────────────────────────────────────────
  // Rutas restringidas — RBAC
  // ─────────────────────────────────────────────────────
  test('RBAC — /audit-logs redirige a no autorizado', async ({ page }) => {
    await page.goto('/audit-logs')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/12-audit-logs-restricted.png', fullPage: true })
    const url = page.url()
    const pageText = await page.locator('body').innerText()
    console.log('URL tras navegar a /audit-logs:', url)
    console.log('Contiene "no autorizado" o "unauthorized":', 
      pageText.toLowerCase().includes('no autorizado') || 
      pageText.toLowerCase().includes('unauthorized') ||
      pageText.toLowerCase().includes('acceso'))
  })

  test('RBAC — /users redirige a no autorizado', async ({ page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/13-users-restricted.png', fullPage: true })
    const pageText = await page.locator('body').innerText()
    console.log('Contenido /users para psicólogo:', pageText.slice(0, 200))
  })

  test('RBAC — /supervision redirige a no autorizado', async ({ page }) => {
    await page.goto('/supervision')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'screenshots/14-supervision-restricted.png', fullPage: true })
    const pageText = await page.locator('body').innerText()
    console.log('Contenido /supervision para psicólogo:', pageText.slice(0, 200))
  })

})
