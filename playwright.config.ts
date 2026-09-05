import { readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// El .env de la raiz decide en que puerto publica nginx. Se lee a mano para no
// agregar dotenv solo para esto; si el archivo no existe se usa el valor por
// defecto del compose.
function envValue(key: string): string | undefined {
  try {
    const line = readFileSync('.env', 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${key}=`));
    return line?.slice(key.length + 1).trim() || undefined;
  } catch {
    return undefined;
  }
}

const port = process.env.WEB_PORT ?? envValue('WEB_PORT') ?? '8080';
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  // Las capturas del README se generan aparte, con "npm run screenshots".
  testIgnore: '**/screenshots.spec.ts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  // El reporte HTML se genera siempre; abrirlo queda a criterio de quien corre
  // la suite, para no lanzar un navegador en medio del pipeline.
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Inicia sesion una vez y guarda el estado: el resto de las pruebas parte
    // de una sesion abierta sin repetir el formulario en cada una.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
