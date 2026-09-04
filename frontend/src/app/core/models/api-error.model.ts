// Formato de error unico que devuelve la API.
export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  requestId?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
