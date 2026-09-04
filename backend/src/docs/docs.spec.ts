import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIV3 } from 'openapi-types';
import { api } from '../test/api';
import { openApiDocument } from './openapi';
import { LEAD_SOURCES, LEAD_STATUSES, MAX_PAGE_SIZE } from '../modules/leads/lead.constants';
import { ErrorCode } from '../shared/errors/AppError';

interface OpenApiPaths {
  paths: Record<string, Record<string, { responses: Record<string, unknown> }>>;
}

// Clonar para que el validador no reciba el objeto congelado con "as const".
function clone(): OpenAPIV3.Document {
  return JSON.parse(JSON.stringify(openApiDocument)) as OpenAPIV3.Document;
}

describe('especificacion OpenAPI', () => {
  it('cumple el estandar OpenAPI 3', async () => {
    await expect(SwaggerParser.validate(clone())).resolves.toBeDefined();
  });

  it('documenta los seis endpoints exigidos por el enunciado', () => {
    const { paths } = openApiDocument as unknown as OpenApiPaths;

    expect(paths['/api/health']).toHaveProperty('get');
    expect(paths['/api/leads']).toHaveProperty('get');
    expect(paths['/api/leads']).toHaveProperty('post');
    expect(paths['/api/leads/{id}']).toHaveProperty('get');
    expect(paths['/api/leads/{id}/status']).toHaveProperty('patch');
    expect(paths['/api/dashboard/summary']).toHaveProperty('get');
  });

  it('mantiene los enums sincronizados con las constantes del dominio', () => {
    const lead = openApiDocument.components.schemas.Lead.properties;

    expect(lead.status.enum).toEqual([...LEAD_STATUSES]);
    expect(lead.source.enum).toEqual([...LEAD_SOURCES]);
    expect(
      openApiDocument.components.schemas.ApiError.properties.error.properties.code.enum,
    ).toEqual(Object.values(ErrorCode));
  });

  it('documenta el tope real de paginacion', () => {
    const { paths } = openApiDocument as unknown as {
      paths: {
        '/api/leads': { get: { parameters: { name: string; schema: { maximum?: number } }[] } };
      };
    };
    const limit = paths['/api/leads'].get.parameters.find((p) => p.name === 'limit');

    expect(limit?.schema.maximum).toBe(MAX_PAGE_SIZE);
  });

  it('protege con token los endpoints de escritura, y solo esos', () => {
    const { paths } = openApiDocument as unknown as {
      paths: Record<string, Record<string, { security?: unknown[] }>>;
    };

    expect(paths['/api/leads'].post.security).toBeDefined();
    expect(paths['/api/leads/{id}/status'].patch.security).toBeDefined();
    expect(paths['/api/leads'].get.security).toBeUndefined();
    expect(paths['/api/leads/{id}'].get.security).toBeUndefined();
    expect(paths['/api/dashboard/summary'].get.security).toBeUndefined();
  });

  it('define un ejemplo propio por respuesta de error, sin reutilizar uno generico', () => {
    const { paths } = openApiDocument as unknown as {
      paths: Record<
        string,
        Record<
          string,
          {
            responses: Record<
              string,
              { content?: Record<string, { example?: { error?: { code: string } } }> }
            >;
          }
        >
      >;
    };
    const codeOf = (path: string, method: string, status: string): string | undefined =>
      paths[path][method].responses[status].content?.['application/json'].example?.error?.code;

    expect(codeOf('/api/leads/{id}', 'get', '400')).toBe(ErrorCode.INVALID_ID);
    expect(codeOf('/api/leads/{id}', 'get', '404')).toBe(ErrorCode.NOT_FOUND);
    expect(codeOf('/api/auth/login', 'post', '401')).toBe(ErrorCode.INVALID_CREDENTIALS);
    expect(codeOf('/api/auth/login', 'post', '429')).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
  });
});

describe('rutas de documentacion', () => {
  it('sirve la especificacion en JSON', async () => {
    const response = await api().get('/api/docs/openapi.json');

    expect(response.status).toBe(200);
    expect((response.body as { openapi: string }).openapi).toBe('3.0.3');
  });

  it('sirve la interfaz de Swagger UI', async () => {
    const response = await api().get('/api/docs/').redirects(1);

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });
});
