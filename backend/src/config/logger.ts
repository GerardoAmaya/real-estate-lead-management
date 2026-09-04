import pino from 'pino';
import { env } from './env';

// Redaccion de campos sensibles: nunca deben llegar a los logs.
const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.currentPassword',
  'req.body.newPassword',
  'password',
  'token',
  'accessToken',
  'jwt',
];

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: { paths: redactPaths, censor: '[REDACTED]' },
  base: { service: 'real-estate-lead-management-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  // En produccion queda JSON plano para los agregadores; en desarrollo se
  // formatea legible ocultando campos que solo importan en produccion.
  transport: env.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname,service,reqId',
          singleLine: true,
        },
      },
});
