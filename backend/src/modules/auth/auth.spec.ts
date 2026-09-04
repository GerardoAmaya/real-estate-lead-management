import { api } from '../../test/api';
import { TEST_USER, createTestUser } from '../../test/fixtures';
import { UserModel } from './user.model';

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createTestUser();
  });

  it('devuelve un token con credenciales validas', async () => {
    const response = await api()
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      user: { email: TEST_USER.email, role: 'admin' },
    });
    expect((response.body as { accessToken: string }).accessToken).toEqual(expect.any(String));
  });

  it('nunca expone el hash de la contrasena', async () => {
    const response = await api()
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(JSON.stringify(response.body)).not.toContain('$2');
    expect(response.body).not.toHaveProperty('user.password');
  });

  it('almacena la contrasena hasheada, nunca en texto plano', async () => {
    const stored = await UserModel.findOne({ email: TEST_USER.email }).select('+password').exec();

    expect(stored?.password).not.toBe(TEST_USER.password);
    expect(stored?.password).toMatch(/^\$2[aby]\$/);
  });

  it('rechaza una contrasena incorrecta', async () => {
    const response = await api()
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'incorrecta' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: { code: 'INVALID_CREDENTIALS' } });
  });

  it('devuelve el mismo error para un correo inexistente, sin revelar si existe', async () => {
    const wrongPassword = await api()
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'incorrecta' });

    const unknownEmail = await api()
      .post('/api/auth/login')
      .send({ email: 'noexiste@example.com', password: 'incorrecta' });

    expect(unknownEmail.status).toBe(wrongPassword.status);
    expect((unknownEmail.body as { error: { message: string } }).error.message).toBe(
      (wrongPassword.body as { error: { message: string } }).error.message,
    );
  });

  it('valida el formato del correo', async () => {
    const response = await api()
      .post('/api/auth/login')
      .send({ email: 'no-es-correo', password: 'x' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });
});

describe('GET /api/auth/me', () => {
  it('requiere token', async () => {
    const response = await api().get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: { code: 'UNAUTHORIZED' } });
  });

  it('rechaza un token invalido', async () => {
    const response = await api().get('/api/auth/me').set('Authorization', 'Bearer basura');

    expect(response.status).toBe(401);
  });
});
