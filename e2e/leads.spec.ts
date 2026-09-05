import { test, expect } from '@playwright/test';

// Prospectos con forma de dato real: si alguna corrida deja registros en la
// base, la pantalla sigue siendo presentable para una demostracion.
const PROSPECTOS = [
  { nombre: 'Valeria Guzmán', correo: 'valeria.guzman@example.com', proyecto: 'Vista Verde' },
  {
    nombre: 'Diego Alvarenga',
    correo: 'diego.alvarenga@example.com',
    proyecto: 'Torres del Valle',
  },
  {
    nombre: 'Ana Sofía Portillo',
    correo: 'ana.portillo@example.com',
    proyecto: 'Residencial Altavista',
  },
];
const INDICADORES = [
  'Total de leads',
  'Presupuesto promedio',
  'Tasa de conversion',
  'Leads reservados',
];

test.beforeEach(async ({ page }) => {
  await page.goto('/leads');
  await expect(page.getByRole('heading', { name: 'Seguimiento de leads' })).toBeVisible();
});

test('muestra los cuatro indicadores del dashboard', async ({ page }) => {
  const indicadores = page.getByRole('region', { name: 'Indicadores' });

  for (const etiqueta of INDICADORES) {
    await expect(indicadores.getByText(etiqueta)).toBeVisible();
  }
});

test('filtrar por estado consulta al backend y acota la tabla', async ({ page }) => {
  const filtros = page.getByRole('region', { name: 'Filtros de leads' });
  const filas = page.locator('tbody tr');
  const sinFiltro = await filas.count();

  // Se espera la peticion real: confirma que el filtro viaja a la API y no
  // se resuelve en memoria.
  const respuesta = page.waitForResponse(
    (r) => r.url().includes('/api/leads?') && r.url().includes('status=Reservado'),
  );
  await filtros.getByLabel('Estado').selectOption('Reservado');
  await respuesta;

  // Se comprueba la invariante, no un numero: toda fila devuelta cumple el
  // filtro. Cuantos leads haya en la base depende de corridas anteriores.
  const filtradas = await filas.count();
  expect(filtradas).toBeGreaterThan(0);
  expect(filtradas).toBeLessThan(sinFiltro);

  for (let i = 0; i < filtradas; i++) {
    await expect(filas.nth(i).getByRole('combobox')).toHaveValue('Reservado');
  }

  await filtros.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(filas).toHaveCount(sinFiltro);
});

test('crea un lead y lo muestra en la tabla', async ({ page }) => {
  // Rota entre los prospectos para que corridas seguidas no repitan el mismo.
  const { nombre, correo, proyecto } = PROSPECTOS[Date.now() % PROSPECTOS.length];

  await page.getByRole('button', { name: 'Nuevo lead' }).click();

  const dialogo = page.getByRole('dialog', { name: 'Nuevo lead' });
  await dialogo.getByLabel('Nombre').fill(nombre);
  await dialogo.getByLabel('Correo').fill(correo);
  await dialogo.getByLabel('Presupuesto').fill('185000');
  await dialogo.getByLabel('Proyecto').fill(proyecto);
  await dialogo.getByRole('button', { name: 'Crear lead' }).click();

  await expect(dialogo).toBeHidden();

  // El orden por defecto es por fecha descendente, asi que el recien creado
  // encabeza la tabla.
  await expect(
    page.locator('tbody tr').first().getByRole('cell', { name: nombre, exact: true }),
  ).toBeVisible();
});

test('cambiar el estado de un lead lo refleja en la fila', async ({ page }) => {
  // Se trabaja sobre la primera fila y no sobre un nombre del seed: crear un
  // lead desplaza a los mas antiguos fuera de la primera pagina. Cada fila
  // tiene un solo desplegable, asi que el rol basta para identificarlo.
  const selector = page.locator('tbody tr').first().getByRole('combobox');

  // El estado depende de corridas anteriores sobre la misma base: se elige
  // uno distinto al actual para que el evento de cambio se dispare siempre.
  const actual = await selector.inputValue();
  const nuevo = actual === 'Calificado' ? 'Contactado' : 'Calificado';

  const respuesta = page.waitForResponse(
    (r) => r.request().method() === 'PATCH' && r.url().includes('/status'),
  );
  await selector.selectOption(nuevo);
  await respuesta;

  // Se comprueba sobre el select, no sobre el texto de la fila: las opciones
  // del desplegable contienen todos los estados y el texto seria ambiguo.
  await expect(page.locator('tbody tr').first().getByRole('combobox')).toHaveValue(nuevo);
});
