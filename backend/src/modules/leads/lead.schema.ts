import { z } from 'zod';
import {
  DEFAULT_PAGE_SIZE,
  LEAD_SOURCES,
  LEAD_STATUSES,
  MAX_PAGE_SIZE,
  SORTABLE_FIELDS,
} from './lead.constants';

// strict() rechaza campos no declarados: bloquea mass assignment.
export const createLeadSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
    email: z.email('El correo no tiene un formato valido').max(160),
    phone: z.string().trim().max(30).optional(),
    source: z.enum(LEAD_SOURCES),
    status: z.enum(LEAD_STATUSES).default('Nuevo'),
    budget: z
      .number('El presupuesto debe ser numerico')
      .positive('El presupuesto debe ser mayor que cero'),
    project: z.string().trim().min(2, 'El proyecto es obligatorio').max(120),
  })
  .strict();

export const updateLeadStatusSchema = z
  .object({
    status: z.enum(LEAD_STATUSES),
  })
  .strict();

export const listLeadsQuerySchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.enum(LEAD_SOURCES).optional(),
    project: z.string().trim().min(1).max(120).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
    sortBy: z.enum(SORTABLE_FIELDS).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
