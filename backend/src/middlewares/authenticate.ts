import type { RequestHandler } from 'express';
import { AppError } from '../shared/errors/AppError';
import { verifyToken } from '../modules/auth/auth.service';

// Extrae y valida el Bearer token. Los errores de jsonwebtoken los traduce
// el manejador central (TokenExpiredError, JsonWebTokenError).
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(AppError.unauthorized('Se requiere un token Bearer en la cabecera Authorization'));
    return;
  }

  try {
    req.user = verifyToken(header.slice('Bearer '.length).trim());
    next();
  } catch (error) {
    next(error);
  }
};
