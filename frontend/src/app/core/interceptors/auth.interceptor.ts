import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

// Adjunta el token a toda peticion saliente hacia la API.
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).token;

  if (!token) return next(request);

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
