import { api } from '../../test/api';

describe('GET /api/health', () => {
  it('reporta la aplicacion operativa y conectada a la base de datos', async () => {
    const response = await api().get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      database: { connected: true, state: 'connected' },
    });
    expect(typeof (response.body as { uptime: number }).uptime).toBe('number');
  });
});
