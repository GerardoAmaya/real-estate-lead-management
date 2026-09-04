import type { Request, RequestHandler } from 'express';
import { Types } from 'mongoose';
import { AppError } from '../shared/errors/AppError';

// Express 5 tipa los parametros como string | string[] por los comodines.
function readParam(req: Request, param: string): string | undefined {
  const value = req.params[param];
  return typeof value === 'string' ? value : undefined;
}

// Valida el parametro antes de tocar la base de datos y devuelve un codigo
// propio: asi el cliente distingue un ID mal formado (400) de uno que no
// existe (404), en lugar de recibir un error de validacion generico.
export function validateObjectId(param = 'id'): RequestHandler {
  return (req, _res, next) => {
    const value = readParam(req, param);

    if (!value || !Types.ObjectId.isValid(value)) {
      next(AppError.invalidId(`El identificador "${String(req.params[param])}" no es valido`));
      return;
    }

    next();
  };
}

// Solo debe usarse en rutas protegidas por validateObjectId.
export function objectIdParam(req: Request, param = 'id'): string {
  return readParam(req, param) ?? '';
}
