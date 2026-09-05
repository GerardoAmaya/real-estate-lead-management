import { devices } from '@playwright/test';
import base from './playwright.config';

// Reutiliza la configuracion de la suite (baseURL incluida) pero sin ignorar el
// archivo de capturas y sin la sesion guardada: cada captura abre la suya.
export default {
  ...base,
  testIgnore: undefined,
  reporter: 'list' as const,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
};
