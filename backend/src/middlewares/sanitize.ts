import type { RequestHandler } from 'express';

// Claves con $ o . permiten inyectar operadores de Mongo ($gt, $where).
function stripOperators(value: unknown, depth = 0): unknown {
  if (depth > 10 || value === null || typeof value !== 'object') return value;

  if (Array.isArray(value)) return value.map((item) => stripOperators(item, depth + 1));

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    result[key] = stripOperators(val, depth + 1);
  }
  return result;
}

export const sanitizeRequest: RequestHandler = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = stripOperators(req.body);
  }
  next();
};
