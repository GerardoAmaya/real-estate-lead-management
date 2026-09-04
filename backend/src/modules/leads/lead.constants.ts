// Valores fijados por el enunciado: unica fuente de verdad para el
// modelo, la validacion Zod y los tipos de TypeScript.
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

export const SORTABLE_FIELDS = ['createdAt', 'budget'] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];

// Tope de paginacion: evita que un limit enorme agote memoria y ancho de banda.
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 10;
