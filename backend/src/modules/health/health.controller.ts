import type { RequestHandler } from 'express';
import { getHealthStatus } from './health.service';

// Express 5 propaga los rechazos de promesas al manejador de errores.
export const healthCheck: RequestHandler = async (_req, res) => {
  const health = await getHealthStatus();
  // 503 cuando la base no responde: util para el healthcheck de Docker.
  res.status(health.status === 'ok' ? 200 : 503).json(health);
};
