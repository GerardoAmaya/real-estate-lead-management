import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi';

export const docsRoutes = Router();

// El JSON crudo permite generar clientes o importar en Postman e Insomnia.
docsRoutes.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

docsRoutes.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'Real Estate Lead Management API',
    swaggerOptions: { persistAuthorization: true, docExpansion: 'list' },
  }),
);
