// Formato de error unico para toda la API.
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
    requestId?: string;
    timestamp: string;
  };
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
