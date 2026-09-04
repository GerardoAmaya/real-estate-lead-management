import { test, expect } from '@playwright/test';

test.describe('control de acceso', () => {
  // Estas pruebas necesitan partir sin sesion, no del estado guardado.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('manda al acceso y conserva el destino', async ({ page }) => {
    await page.goto('/leads?page=2');

    await expect(page).toHaveURL(/\/login\?returnUrl=/);
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();

    await page.getByRole('button', { name: 'Usarlas en el formulario' }).click();
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Vuelve exactamente adonde iba, con el parametro intacto.
    await expect(page).toHaveURL(/\/leads\?page=2/);
  });

  test('rechaza credenciales incorrectas sin abrir sesion', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Correo').fill('admin@example.com');
    await page.getByLabel('Contrasena').fill('contrasena-incorrecta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('con sesion abierta', () => {
  test('no permite volver al formulario de acceso', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/leads/);
  });

  test('cerrar sesion devuelve al acceso', async ({ page }) => {
    await page.goto('/leads');
    await page.getByRole('button', { name: 'Salir' }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
