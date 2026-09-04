import { env } from '../config/env';
import { ErrorCode } from '../shared/errors/AppError';
import { LEAD_SOURCES, LEAD_STATUSES, SORTABLE_FIELDS } from '../modules/leads/lead.constants';
import { MAX_LIMIT, schemas } from './components';

interface ErrorDetailExample {
  field: string;
  message: string;
}

// El ejemplo va por respuesta, no en el esquema compartido: si viviera en
// ApiError, un 429 mostraria el mismo cuerpo de ejemplo que un 404.
function errorResponse(
  description: string,
  code: ErrorCode,
  message: string,
  details?: ErrorDetailExample[],
): object {
  return {
    description,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
        example: {
          error: {
            code,
            message,
            ...(details ? { details } : {}),
            requestId: '3f7a1c92-4b8e-4d5a-9c1f-2e6b8a0d4f31',
            timestamp: '2026-09-04T15:05:02.354Z',
          },
        },
      },
    },
  };
}

export const openApiDocument = {
  openapi: '3.0.3',

  info: {
    title: 'Real Estate Lead Management API',
    version: '1.0.0',
    description: [
      'API de seguimiento de leads inmobiliarios.',
      '',
      '**Autenticacion:** las lecturas son publicas; crear un lead y cambiar su estado',
      'requieren un token Bearer obtenido en `POST /api/auth/login`.',
      '',
      '**Errores:** todas las respuestas de error comparten el mismo formato, con un',
      '`code` estable para que el cliente reaccione sin depender del texto del mensaje.',
      '',
      '**Correlacion:** cada respuesta incluye la cabecera `x-request-id`, presente',
      'tambien en los logs del servidor.',
    ].join('\n'),
  },

  servers: [{ url: `http://localhost:${String(env.PORT)}`, description: 'Entorno local' }],

  tags: [
    { name: 'Health', description: 'Estado de la aplicacion' },
    { name: 'Auth', description: 'Autenticacion' },
    { name: 'Leads', description: 'Gestion de leads' },
    { name: 'Dashboard', description: 'Indicadores agregados' },
  ],

  components: {
    schemas,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token devuelto por POST /api/auth/login.',
      },
    },
  },

  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Estado de la API y de la base de datos',
        description:
          'Verifica la conexion con MongoDB mediante un ping real. Devuelve 503 cuando ' +
          'la base no responde, lo que permite usarlo como healthcheck de Docker.',
        responses: {
          200: {
            description: 'La aplicacion y la base de datos responden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthStatus' },
                example: {
                  status: 'ok',
                  uptime: 3600,
                  timestamp: '2026-09-04T15:05:02.352Z',
                  database: { connected: true, state: 'connected' },
                },
              },
            },
          },
          503: {
            description: 'La base de datos no responde',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthStatus' },
                example: {
                  status: 'degraded',
                  uptime: 42,
                  timestamp: '2026-09-04T15:05:02.352Z',
                  database: { connected: false, state: 'disconnected' },
                },
              },
            },
          },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Obtener un token de acceso',
        description:
          'Limitado a un numero reducido de intentos fallidos por ventana de tiempo. ' +
          'Un correo inexistente y una contrasena incorrecta devuelven exactamente el ' +
          'mismo error, para no revelar que correos estan registrados.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Credenciales validas',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          400: errorResponse(
            'Datos de entrada invalidos',
            ErrorCode.VALIDATION_ERROR,
            'Los datos enviados no son validos',
            [{ field: 'email', message: 'El correo no tiene un formato valido' }],
          ),
          401: errorResponse(
            'Credenciales invalidas',
            ErrorCode.INVALID_CREDENTIALS,
            'Credenciales invalidas',
          ),
          429: errorResponse(
            'Demasiados intentos fallidos',
            ErrorCode.RATE_LIMIT_EXCEEDED,
            'Demasiadas peticiones, intente de nuevo mas tarde',
          ),
        },
      },
    },

    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Datos del token actual',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Contenido del token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sub: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['admin', 'agent'] },
                  },
                },
              },
            },
          },
          401: errorResponse(
            'Token ausente, invalido o expirado',
            ErrorCode.UNAUTHORIZED,
            'Se requiere un token Bearer en la cabecera Authorization',
          ),
        },
      },
    },

    '/api/leads': {
      get: {
        tags: ['Leads'],
        summary: 'Listar leads con filtros, paginacion y ordenamiento',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: [...LEAD_STATUSES] },
            description: 'Filtra por estado comercial',
          },
          {
            name: 'source',
            in: 'query',
            schema: { type: 'string', enum: [...LEAD_SOURCES] },
            description: 'Filtra por canal de origen',
          },
          {
            name: 'project',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtra por proyecto',
            example: 'Vista Verde',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, default: 10 },
            description: `Tamano de pagina. El maximo es ${String(MAX_LIMIT)} para evitar consumo excesivo de recursos.`,
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: [...SORTABLE_FIELDS], default: 'createdAt' },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: {
            description: 'Pagina de resultados con metadatos de paginacion',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedLeads' } },
            },
          },
          400: errorResponse(
            'Parametros de consulta invalidos',
            ErrorCode.VALIDATION_ERROR,
            'Los datos enviados no son validos',
            [{ field: 'limit', message: 'Too big: expected number to be <=100' }],
          ),
        },
      },

      post: {
        tags: ['Leads'],
        summary: 'Crear un lead',
        description:
          'Los campos no declarados en el esquema se rechazan, lo que impide asignar ' +
          'propiedades no previstas al documento.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateLeadRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Lead creado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Lead' } } },
          },
          400: errorResponse(
            'Datos invalidos o campos no permitidos',
            ErrorCode.VALIDATION_ERROR,
            'Los datos enviados no son validos',
            [{ field: 'budget', message: 'El presupuesto debe ser mayor que cero' }],
          ),
          401: errorResponse(
            'Se requiere autenticacion',
            ErrorCode.UNAUTHORIZED,
            'Se requiere un token Bearer en la cabecera Authorization',
          ),
        },
      },
    },

    '/api/leads/{id}': {
      get: {
        tags: ['Leads'],
        summary: 'Obtener un lead por identificador',
        description:
          'Distingue un identificador mal formado (400, codigo INVALID_ID) de uno ' +
          'valido pero inexistente (404).',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: '66d8f1a2b3c4d5e6f7a8b9c0',
          },
        ],
        responses: {
          200: {
            description: 'Lead encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Lead' } } },
          },
          400: errorResponse(
            'El identificador no es un ObjectId valido',
            ErrorCode.INVALID_ID,
            'El identificador "abc123" no es valido',
          ),
          404: errorResponse(
            'No existe un lead con ese identificador',
            ErrorCode.NOT_FOUND,
            'No existe un lead con el identificador 507f1f77bcf86cd799439011',
          ),
        },
      },
    },

    '/api/leads/{id}/status': {
      patch: {
        tags: ['Leads'],
        summary: 'Actualizar el estado comercial de un lead',
        description: 'Solo modifica el estado; cualquier otro campo enviado se rechaza.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: '66d8f1a2b3c4d5e6f7a8b9c0',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateLeadStatusRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Lead actualizado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Lead' } } },
          },
          400: errorResponse(
            'Estado no permitido, campos extra o identificador invalido',
            ErrorCode.VALIDATION_ERROR,
            'Los datos enviados no son validos',
            [
              {
                field: 'status',
                message:
                  'Invalid option: expected one of "Nuevo"|"Contactado"|"Calificado"|"Reservado"|"Descartado"',
              },
            ],
          ),
          401: errorResponse(
            'Se requiere autenticacion',
            ErrorCode.UNAUTHORIZED,
            'Se requiere un token Bearer en la cabecera Authorization',
          ),
          404: errorResponse(
            'No existe un lead con ese identificador',
            ErrorCode.NOT_FOUND,
            'No existe un lead con el identificador 507f1f77bcf86cd799439011',
          ),
        },
      },
    },

    '/api/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Indicadores agregados del dashboard',
        description:
          'Calcula los siete indicadores con un unico Aggregation Pipeline basado en ' +
          '$facet. La agregacion ocurre integramente en MongoDB: no se cargan ' +
          'documentos en memoria de la aplicacion.',
        responses: {
          200: {
            description: 'Indicadores calculados',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/DashboardSummary' } },
            },
          },
        },
      },
    },
  },
} as const;
