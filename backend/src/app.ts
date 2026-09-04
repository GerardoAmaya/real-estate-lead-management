import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { env } from './config/env';
import { logger } from './config/logger';
import { apiRouter } from './routes';
import { sanitizeRequest } from './middlewares/sanitize';
import { notFoundHandler } from './middlewares/not-found';
import { errorHandler } from './middlewares/error-handler';
import { AppError, ErrorCode } from './shared/errors/AppError';

function requestPath(req: IncomingMessage & { originalUrl?: string }): string {
  return req.originalUrl ?? req.url ?? '';
}

// El origen propio siempre se permite: Swagger UI se sirve desde la misma
// API, y comparar contra el host de la peticion funciona igual en local, en
// Docker y detras de un dominio, sin listar puertos a mano.
function isSameOrigin(origin: string, host: string | undefined): boolean {
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// La app se exporta sin escuchar en un puerto: asi los tests la montan
// con Supertest sin abrir sockets ni conectar a la base de datos.
export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Correlation ID por request: hilo conductor para diagnosticar en logs.
  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];
        const id = typeof existing === 'string' && existing ? existing : randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      autoLogging: { ignore: (req) => req.url === '/api/health' },
      // Una linea por peticion en lugar del volcado completo de req y res.
      // originalUrl conserva la ruta completa: Express muta req.url al montar routers.
      customSuccessMessage: (req, res) => `${req.method ?? ''} ${requestPath(req)} ${res.statusCode}`,
      customErrorMessage: (req, res, error) =>
        `${req.method ?? ''} ${requestPath(req)} ${res.statusCode} - ${error.message}`,
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      // El manejador de errores ya registra el error real con su contexto;
      // el que sintetiza pino-http solo duplicaria el stack trace.
      serializers: {
        req: () => undefined,
        res: () => undefined,
        err: () => undefined,
      },
    }),
  );

  // Swagger UI necesita estilos e imagenes en linea; el resto de la politica
  // por defecto de Helmet se mantiene intacta.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'script-src': ["'self'"],
        },
      },
    }),
  );
  app.use(compression());

  app.use(
    cors((req, callback) => {
      const origin = req.headers.origin;

      // Sin origin: herramientas como curl o Postman.
      if (!origin || env.corsOrigins.includes(origin) || isSameOrigin(origin, req.headers.host)) {
        callback(null, { origin: true, credentials: true });
        return;
      }

      callback(AppError.forbidden(`Origen no permitido por CORS: ${origin}`));
    }),
  );

  // Limite de tamano: evita cuerpos enormes que consuman memoria.
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Elimina claves con $ o . para bloquear inyeccion de operadores de Mongo.
  app.use(sanitizeRequest);

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: (req) => req.path === '/api/health' || req.path.startsWith('/api/docs'),
      handler: (_req, _res, next) => {
        next(
          new AppError(
            429,
            ErrorCode.RATE_LIMIT_EXCEEDED,
            'Demasiadas peticiones, intente de nuevo mas tarde',
          ),
        );
      },
    }),
  );

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
