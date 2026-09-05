import { test, expect } from '@playwright/test';

// No forma parte de la suite: se ejecuta con "npm run screenshots" para
// regenerar las imagenes del README cuando cambia la interfaz. Requiere una
// base recien sembrada (npm run docker:reset) para que el dashboard muestre los
// valores de control del Anexo A y no los datos de las pruebas E2E.
const DESTINO = 'docs/screenshots';

test.use({ viewport: { width: 1440, height: 900 } });

test('captura la pantalla de acceso', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/login');

  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  await page.screenshot({ path: `${DESTINO}/login.png` });
});

test('captura el dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Correo').fill('admin@example.com');
  await page.getByLabel('Contrasena').fill('Admin123!');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('heading', { name: 'Seguimiento de leads' })).toBeVisible();
  await expect(page.locator('tbody tr').first()).toBeVisible();
  await page.screenshot({ path: `${DESTINO}/dashboard.png`, fullPage: true });
});

test('captura el formulario de nuevo lead', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Correo').fill('admin@example.com');
  await page.getByLabel('Contrasena').fill('Admin123!');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.getByRole('button', { name: 'Nuevo lead' }).click();
  await expect(page.getByRole('dialog', { name: 'Nuevo lead' })).toBeVisible();
  await page.screenshot({ path: `${DESTINO}/nuevo-lead.png` });
});
