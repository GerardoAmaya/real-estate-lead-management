import { api, authToken } from '../../test/api';
import { VALID_LEAD, seedAnexoA } from '../../test/fixtures';
import { LeadModel } from './lead.model';

interface ListBody {
  data: { budget: number; status: string; source: string; project: string }[];
  meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean };
}

describe('GET /api/leads', () => {
  beforeEach(async () => {
    await seedAnexoA();
  });

  it('devuelve la primera pagina con metadatos de paginacion', async () => {
    const response = await api().get('/api/leads');
    const body = response.body as ListBody;

    expect(response.status).toBe(200);
    expect(body.meta).toMatchObject({ total: 10, page: 1, limit: 10, totalPages: 1 });
    expect(body.data).toHaveLength(10);
  });

  it('filtra por estado', async () => {
    const response = await api().get('/api/leads?status=Reservado');
    const body = response.body as ListBody;

    expect(body.meta.total).toBe(2);
    expect(body.data.every((lead) => lead.status === 'Reservado')).toBe(true);
  });

  it('filtra por fuente', async () => {
    const body = (await api().get('/api/leads?source=Facebook')).body as ListBody;

    expect(body.meta.total).toBe(3);
    expect(body.data.every((lead) => lead.source === 'Facebook')).toBe(true);
  });

  it('filtra por proyecto', async () => {
    const body = (await api().get('/api/leads?project=Vista Verde')).body as ListBody;

    expect(body.meta.total).toBe(3);
  });

  it('combina varios filtros', async () => {
    const body = (await api().get('/api/leads?status=Reservado&project=Torres del Valle'))
      .body as ListBody;

    expect(body.meta.total).toBe(2);
  });

  it('pagina correctamente', async () => {
    const body = (await api().get('/api/leads?page=2&limit=4')).body as ListBody;

    expect(body.data).toHaveLength(4);
    expect(body.meta).toMatchObject({ page: 2, totalPages: 3, hasNextPage: true });
  });

  it('ordena por presupuesto descendente', async () => {
    const body = (await api().get('/api/leads?sortBy=budget&sortOrder=desc')).body as ListBody;
    const budgets = body.data.map((lead) => lead.budget);

    expect(budgets).toEqual([...budgets].sort((a, b) => b - a));
    expect(budgets[0]).toBe(220000);
  });

  it('ordena por presupuesto ascendente', async () => {
    const body = (await api().get('/api/leads?sortBy=budget&sortOrder=asc')).body as ListBody;

    expect(body.data[0]?.budget).toBe(115000);
  });

  it('rechaza un limit por encima del tope permitido', async () => {
    const response = await api().get('/api/leads?limit=999999');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it('rechaza ordenar por un campo no permitido', async () => {
    const response = await api().get('/api/leads?sortBy=password');

    expect(response.status).toBe(400);
  });

  it('devuelve una lista vacia coherente cuando ningun lead coincide', async () => {
    await LeadModel.deleteMany({});
    const body = (await api().get('/api/leads')).body as ListBody;

    expect(body.data).toEqual([]);
    expect(body.meta).toMatchObject({ total: 0, totalPages: 0, hasNextPage: false });
  });
});

describe('GET /api/leads/:id', () => {
  it('devuelve un lead existente', async () => {
    const created = await LeadModel.create({ ...VALID_LEAD });

    const response = await api().get(`/api/leads/${created.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ email: VALID_LEAD.email });
  });

  it('distingue un identificador mal formado con 400', async () => {
    const response = await api().get('/api/leads/no-es-un-object-id');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: 'INVALID_ID' } });
  });

  it('distingue un identificador valido pero inexistente con 404', async () => {
    const response = await api().get('/api/leads/507f1f77bcf86cd799439011');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });
});

describe('POST /api/leads', () => {
  it('requiere autenticacion', async () => {
    const response = await api().post('/api/leads').send(VALID_LEAD);

    expect(response.status).toBe(401);
    expect(await LeadModel.countDocuments()).toBe(0);
  });

  it('crea el lead con token valido', async () => {
    const token = await authToken();

    const response = await api()
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LEAD);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ email: VALID_LEAD.email, status: 'Nuevo' });
    expect(await LeadModel.countDocuments()).toBe(1);
  });

  it('rechaza un presupuesto menor o igual a cero', async () => {
    const token = await authToken();

    const response = await api()
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LEAD, budget: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it('rechaza un correo con formato invalido', async () => {
    const token = await authToken();

    const response = await api()
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LEAD, email: 'no-es-correo' });

    expect(response.status).toBe(400);
  });

  it('rechaza un estado fuera de los permitidos', async () => {
    const token = await authToken();

    const response = await api()
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LEAD, status: 'Vendido' });

    expect(response.status).toBe(400);
  });

  it('bloquea mass assignment de campos no declarados', async () => {
    const token = await authToken();

    const response = await api()
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LEAD, role: 'admin', _id: '507f1f77bcf86cd799439011' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it('bloquea la inyeccion de operadores de Mongo', async () => {
    const token = await authToken();

    const response = await api()
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LEAD, budget: { $gt: 0 } });

    expect(response.status).toBe(400);
  });
});

describe('PATCH /api/leads/:id/status', () => {
  it('requiere autenticacion', async () => {
    const created = await LeadModel.create({ ...VALID_LEAD });

    const response = await api()
      .patch(`/api/leads/${created.id}/status`)
      .send({ status: 'Reservado' });

    expect(response.status).toBe(401);
  });

  it('actualiza unicamente el estado', async () => {
    const token = await authToken();
    const created = await LeadModel.create({ ...VALID_LEAD });

    const response = await api()
      .patch(`/api/leads/${created.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Reservado' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'Reservado', budget: VALID_LEAD.budget });
  });

  it('rechaza un estado no permitido', async () => {
    const token = await authToken();
    const created = await LeadModel.create({ ...VALID_LEAD });

    const response = await api()
      .patch(`/api/leads/${created.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Vendido' });

    expect(response.status).toBe(400);
  });

  it('impide modificar otros campos por esta ruta', async () => {
    const token = await authToken();
    const created = await LeadModel.create({ ...VALID_LEAD });

    const response = await api()
      .patch(`/api/leads/${created.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Reservado', budget: 1 });

    expect(response.status).toBe(400);
  });

  it('devuelve 404 para un lead inexistente', async () => {
    const token = await authToken();

    const response = await api()
      .patch('/api/leads/507f1f77bcf86cd799439011/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Reservado' });

    expect(response.status).toBe(404);
  });
});

describe('rutas inexistentes', () => {
  it('responden 404 con el formato de error consistente', async () => {
    const response = await api().get('/api/no-existe');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: 'NOT_FOUND', message: expect.any(String) },
    });
  });
});
