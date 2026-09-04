import type { TokenPayload } from '../../modules/auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      // Datos ya validados por Zod; los controladores leen de aqui.
      validated?: {
        query?: unknown;
        params?: unknown;
      };
      // Cargado por el middleware authenticate.
      user?: TokenPayload;
    }
  }
}

export {};
