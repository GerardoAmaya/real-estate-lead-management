declare global {
  namespace Express {
    interface Request {
      // Datos ya validados por Zod; los controladores leen de aqui.
      validated?: {
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
