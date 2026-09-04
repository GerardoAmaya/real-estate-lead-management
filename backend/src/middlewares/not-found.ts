import type { RequestHandler } from 'express';
import { AppError } from '../shared/errors/AppError';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`La ruta ${req.method} ${req.originalUrl} no existe`));
};
