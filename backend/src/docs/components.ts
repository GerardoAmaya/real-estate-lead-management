import { LEAD_SOURCES, LEAD_STATUSES } from '../modules/leads/lead.constants';
import { ErrorCode } from '../shared/errors/AppError';

// Los enums salen de las constantes del dominio: la documentacion no puede
// desincronizarse del codigo porque no los repite.
export const schemas = {
  Lead: {
    type: 'object',
    required: ['id', 'name', 'email', 'source', 'status', 'budget', 'project'],
    properties: {
      id: { type: 'string', example: '66d8f1a2b3c4d5e6f7a8b9c0' },
      name: { type: 'string', minLength: 2, maxLength: 120, example: 'Carlos Mendoza' },
      email: { type: 'string', format: 'email', example: 'carlos@example.com' },
      phone: { type: 'string', maxLength: 30, example: '7000-1001' },
      source: { type: 'string', enum: [...LEAD_SOURCES], example: 'Facebook' },
      status: { type: 'string', enum: [...LEAD_STATUSES], example: 'Nuevo' },
      budget: { type: 'number', minimum: 0, exclusiveMinimum: true, example: 145000 },
      project: { type: 'string', maxLength: 120, example: 'Residencial Altavista' },
      createdAt: { type: 'string', format: 'date-time', example: '2026-08-01T00:00:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2026-08-01T00:00:00.000Z' },
    },
  },

  CreateLeadRequest: {
    type: 'object',
    required: ['name', 'email', 'source', 'budget', 'project'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 120, example: 'Ana Portillo' },
      email: { type: 'string', format: 'email', example: 'ana@example.com' },
      phone: { type: 'string', maxLength: 30, example: '7000-2001' },
      source: { type: 'string', enum: [...LEAD_SOURCES], example: 'Website' },
      status: {
        type: 'string',
        enum: [...LEAD_STATUSES],
        default: 'Nuevo',
        description: 'Opcional. Si se omite, el lead se crea como Nuevo.',
      },
      budget: { type: 'number', minimum: 0, exclusiveMinimum: true, example: 180000 },
      project: { type: 'string', minLength: 2, maxLength: 120, example: 'Vista Verde' },
    },
  },

  UpdateLeadStatusRequest: {
    type: 'object',
    required: ['status'],
    additionalProperties: false,
    properties: { status: { type: 'string', enum: [...LEAD_STATUSES], example: 'Reservado' } },
  },

  PaginationMeta: {
    type: 'object',
    properties: {
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 10 },
      total: { type: 'integer', example: 10 },
      totalPages: { type: 'integer', example: 1 },
      hasNextPage: { type: 'boolean', example: false },
      hasPreviousPage: { type: 'boolean', example: false },
    },
  },

  PaginatedLeads: {
    type: 'object',
    properties: {
      data: { type: 'array', items: { $ref: '#/components/schemas/Lead' } },
      meta: { $ref: '#/components/schemas/PaginationMeta' },
    },
  },

  GroupCount: {
    type: 'object',
    properties: {
      label: { type: 'string', example: 'Facebook' },
      count: { type: 'integer', example: 3 },
    },
  },

  DashboardSummary: {
    type: 'object',
    description:
      'Indicadores calculados en MongoDB con un unico Aggregation Pipeline ($facet). ' +
      'Los valores del ejemplo corresponden al dataset del Anexo A.',
    properties: {
      totalLeads: { type: 'integer', example: 10 },
      averageBudget: { type: 'number', example: 174000 },
      reservedLeads: { type: 'integer', example: 2 },
      conversionRate: {
        type: 'number',
        description: 'Reservados / Total x 100',
        example: 20,
      },
      byStatus: { type: 'array', items: { $ref: '#/components/schemas/GroupCount' } },
      bySource: { type: 'array', items: { $ref: '#/components/schemas/GroupCount' } },
      byProject: { type: 'array', items: { $ref: '#/components/schemas/GroupCount' } },
    },
  },

  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', format: 'email', example: 'admin@example.com' },
      password: { type: 'string', format: 'password', example: 'Admin123!' },
    },
  },

  LoginResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      expiresIn: { type: 'string', example: '1h' },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'Admin Demo' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'agent'] },
        },
      },
    },
  },

  HealthStatus: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ok', 'degraded'], example: 'ok' },
      uptime: { type: 'integer', description: 'Segundos desde el arranque', example: 3600 },
      timestamp: { type: 'string', format: 'date-time' },
      database: {
        type: 'object',
        properties: {
          connected: { type: 'boolean', example: true },
          state: { type: 'string', example: 'connected' },
        },
      },
    },
  },

  ApiError: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        required: ['code', 'message', 'timestamp'],
        properties: {
          // Sin example aqui: cada respuesta define el suyo, porque un mismo
          // ejemplo compartido seria incorrecto para la mayoria de los codigos.
          code: { type: 'string', enum: Object.values(ErrorCode) },
          message: { type: 'string' },
          details: {
            type: 'array',
            description: 'Presente solo en errores de validacion.',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
          requestId: {
            type: 'string',
            description: 'Correlaciona la respuesta con los logs del servidor.',
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
} as const;
