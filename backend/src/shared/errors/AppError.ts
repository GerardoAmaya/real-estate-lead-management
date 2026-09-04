// Codigos de error de dominio: el cliente los usa para reaccionar
// sin depender del texto del mensaje.
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_ID = 'INVALID_ID',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetail[];
  // Distingue errores esperados del dominio de fallos inesperados.
  public readonly isOperational = true;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: ErrorDetail[]): AppError {
    return new AppError(400, ErrorCode.VALIDATION_ERROR, message, details);
  }

  static invalidId(message = 'El identificador proporcionado no es valido'): AppError {
    return new AppError(400, ErrorCode.INVALID_ID, message);
  }

  static unauthorized(message = 'Se requiere autenticacion'): AppError {
    return new AppError(401, ErrorCode.UNAUTHORIZED, message);
  }

  static invalidCredentials(message = 'Credenciales invalidas'): AppError {
    return new AppError(401, ErrorCode.INVALID_CREDENTIALS, message);
  }

  static forbidden(message = 'No tiene permisos para realizar esta accion'): AppError {
    return new AppError(403, ErrorCode.FORBIDDEN, message);
  }

  static notFound(message = 'Recurso no encontrado'): AppError {
    return new AppError(404, ErrorCode.NOT_FOUND, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, ErrorCode.DUPLICATE_RESOURCE, message);
  }

  static serviceUnavailable(message: string): AppError {
    return new AppError(503, ErrorCode.SERVICE_UNAVAILABLE, message);
  }
}
