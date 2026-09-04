import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../../config/env';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import * as controller from './auth.controller';
import { loginSchema } from './auth.schema';

// Limite mas estricto que el global: el login es el objetivo de los
// ataques de fuerza bruta y de relleno de credenciales.
const loginLimiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const authRoutes = Router();

authRoutes.post('/login', loginLimiter, validate({ body: loginSchema }), controller.login);

authRoutes.get('/me', authenticate, controller.me);
