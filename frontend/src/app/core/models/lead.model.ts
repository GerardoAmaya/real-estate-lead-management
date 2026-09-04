// Espejo de los contratos de la API. Los literales se declaran una sola vez
// y de ellos derivan los tipos, igual que en el backend.
export const LEAD_STATUSES = [
  'Nuevo',
  'Contactado',
  'Calificado',
  'Reservado',
  'Descartado',
] as const;

export const LEAD_SOURCES = ['Facebook', 'Instagram', 'Website', 'Referido'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  budget: number;
  project: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status?: LeadStatus;
  budget: number;
  project: string;
}

export type SortableField = 'createdAt' | 'budget';
export type SortOrder = 'asc' | 'desc';

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  project?: string;
}

export interface LeadQuery extends LeadFilters {
  page: number;
  limit: number;
  sortBy: SortableField;
  sortOrder: SortOrder;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const DEFAULT_LEAD_QUERY: LeadQuery = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};
