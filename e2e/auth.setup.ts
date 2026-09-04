import { test as setup, expect } from '@playwright/test';

const STORAGE_STATE = 'e2e/.auth/user.json';

setup('inicia sesion y guarda el estado', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Correo').fill('admin@example.com');
  await page.getByLabel('Contrasena').fill('Admin123!');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/leads/);
  await expect(page.getByRole('heading', { name: 'Seguimiento de leads' })).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE });
});
