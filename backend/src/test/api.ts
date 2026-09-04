import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../app';
import { TEST_USER, createTestUser } from './fixtures';

export const app: Express = createApp();

export const api = (): request.Agent => request(app);

// Crea el usuario y devuelve un token listo para la cabecera Authorization.
export async function authToken(): Promise<string> {
  await createTestUser();
  const response = await api()
    .post('/api/auth/login')
    .send({ email: TEST_USER.email, password: TEST_USER.password });
  return (response.body as { accessToken: string }).accessToken;
}
