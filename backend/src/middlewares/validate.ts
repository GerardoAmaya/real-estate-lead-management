import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

// Express 5 memoiza req.query y descarta las mutaciones, por eso el
// resultado validado se expone en req.validated en lugar de sobrescribirlo.
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      req.validated ??= {};
      if (schemas.params) req.validated.params = schemas.params.parse(req.params);
      if (schemas.query) req.validated.query = schemas.query.parse(req.query);
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Accesores tipados para no repetir casts en cada controlador.
export function validatedQuery<T>(req: { validated?: { query?: unknown } }): T {
  return req.validated?.query as T;
}

export function validatedParams<T>(req: { validated?: { params?: unknown } }): T {
  return req.validated?.params as T;
}
