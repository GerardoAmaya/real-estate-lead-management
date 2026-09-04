import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError, ErrorCode, type ErrorDetail } from '../shared/errors/AppError';
import type { ApiErrorBody } from '../shared/types/api';
import { env } from '../config/env';
import { logger } from '../config/logger';

function zodToDetails(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

// Traduce cualquier error a AppError para tener una sola forma de respuesta.
function normalize(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    return AppError.badRequest('Los datos enviados no son validos', zodToDetails(error));
  }

  if (error instanceof mongoose.Error.CastError) {
    return AppError.invalidId(`El valor de "${error.path}" no es un identificador valido`);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return AppError.badRequest('Los datos enviados no son validos', details);
  }

  // Indice unico violado: Mongo lo reporta como error 11000.
  if (typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000) {
    return AppError.conflict('Ya existe un registro con ese valor unico');
  }

  if (error instanceof Error && error.name === 'TokenExpiredError') {
    return new AppError(401, ErrorCode.TOKEN_EXPIRED, 'El token ha expirado');
  }

  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    return AppError.unauthorized('El token proporcionado no es valido');
  }

  return new AppError(500, ErrorCode.INTERNAL_ERROR, 'Ocurrio un error interno');
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const appError = normalize(error);
  const requestId = req.id as string | undefined;

  if (appError.statusCode >= 500) {
    logger.error({ err: error, requestId, path: req.path }, 'Error no controlado');
  } else {
    logger.warn({ code: appError.code, requestId, path: req.path }, appError.message);
  }

  const body: ApiErrorBody = {
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
      ...(requestId ? { requestId } : {}),
      timestamp: new Date().toISOString(),
    },
  };

  // El stack solo se expone fuera de produccion.
  if (!env.isProduction && error instanceof Error) {
    (body.error as Record<string, unknown>).stack = error.stack;
  }

  res.status(appError.statusCode).json(body);
};
