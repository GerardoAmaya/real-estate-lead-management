import { isSameOrigin } from './app';
import { api } from './test/api';

// El origen permitido por defecto en las pruebas viene del esquema de entorno.
const ALLOWED_ORIGIN = 'http://localhost:4200';

describe('isSameOrigin', () => {
  it('reconoce el origen propio del servidor', () => {
    expect(isSameOrigin('http://api.example.com', 'api.example.com')).toBe(true);
  });

  it('distingue el puerto', () => {
    expect(isSameOrigin('http://localhost:3000', 'localhost:4200')).toBe(false);
  });

  it('devuelve false sin cabecera Host', () => {
    expect(isSameOrigin('http://api.example.com', undefined)).toBe(false);
  });

  it('no lanza con un origen malformado', () => {
    expect(isSameOrigin('no-es-una-url', 'api.example.com')).toBe(false);
  });
});

describe('politica de CORS', () => {
  // Se usa una ruta que responde sin tocar la base de datos.
  const request = (): ReturnType<typeof api> => api();

  it('permite peticiones sin Origin, como curl o Postman', async () => {
    const response = await request().get('/api/leads/no-es-object-id');

    expect(response.status).toBe(400);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('permite un origen de la lista blanca y lo refleja en la cabecera', async () => {
    const response = await request()
      .get('/api/leads/no-es-object-id')
      .set('Origin', ALLOWED_ORIGIN);

    expect(response.status).toBe(400);
    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('permite el origen propio de la API, para que Swagger UI funcione', async () => {
    const response = await request()
      .get('/api/leads/no-es-object-id')
      .set('Host', 'api.example.com')
      .set('Origin', 'http://api.example.com');

    expect(response.status).toBe(400);
    expect(response.headers['access-control-allow-origin']).toBe('http://api.example.com');
  });

  it('rechaza un origen ajeno', async () => {
    const response = await request()
      .get('/api/leads/no-es-object-id')
      .set('Origin', 'https://sitio-malicioso.com');

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ error: { code: 'FORBIDDEN' } });
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rechaza un origen malformado sin provocar un error interno', async () => {
    const response = await request()
      .get('/api/leads/no-es-object-id')
      .set('Origin', 'no-es-una-url');

    expect(response.status).toBe(403);
  });
});

describe('cabeceras de seguridad', () => {
  it('aplica Helmet y oculta la tecnologia del servidor', async () => {
    const response = await api().get('/api/health');

    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });

  it('no consume cuota de rate limit en health ni en la documentacion', async () => {
    const health = await api().get('/api/health');
    const docs = await api().get('/api/docs/openapi.json');

    expect(health.headers.ratelimit).toBeUndefined();
    expect(docs.headers.ratelimit).toBeUndefined();
  });
});
