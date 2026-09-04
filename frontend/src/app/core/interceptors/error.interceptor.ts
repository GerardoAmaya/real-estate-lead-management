import { inject } from '@angular/core';
import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import type { ApiErrorResponse } from '../models/api-error.model';

// Traduce cualquier fallo a un mensaje legible, aprovechando el formato de
// error unico de la API y sus "details" de validacion.
export function toMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifique que la API este disponible.';
  }

  const body = error.error as ApiErrorResponse | null;
  const apiError = body?.error;

  if (!apiError) return 'Ocurrio un error inesperado.';

  if (apiError.details?.length) {
    return apiError.details.map((detail) => `${detail.field}: ${detail.message}`).join(' · ');
  }

  return apiError.message;
}

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token vencido o invalido: se cierra la sesion local y se vuelve al acceso.
      if (error.status === 401 && auth.isAuthenticated) {
        auth.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => new Error(toMessage(error)));
    }),
  );
};
