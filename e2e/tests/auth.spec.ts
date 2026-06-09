import { test, expect } from '@playwright/test'

const legacyAdminUsername = process.env.E2E_ADMIN_EMAIL
if (legacyAdminUsername && legacyAdminUsername.includes('@')) {
  throw new Error(
    'E2E_ADMIN_EMAIL is deprecated and login expects a username. Set E2E_ADMIN_USERNAME (e.g. "EdgarGMZ").'
  )
}

const adminUsername =
  process.env.E2E_ADMIN_USERNAME ??
  legacyAdminUsername ??
  'EdgarGMZ'
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? 'Password123!'

test.describe('Autenticación (ut-care)', () => {
  test('muestra el formulario de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('login-username')).toBeVisible()
    await expect(page.getByTestId('login-password')).toBeVisible()
    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('login correcto y redirige al dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-username').fill(adminUsername)
    await page.getByTestId('login-password').fill(adminPassword)
    await page.getByTestId('login-submit').click()
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 90_000 })
  })

  test('credenciales incorrectas muestran diálogo de error', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-username').fill(adminUsername)
    await page.getByTestId('login-password').fill('wrong-password-e2e')
    await page.getByTestId('login-submit').click()
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 15_000 })
  })
})
