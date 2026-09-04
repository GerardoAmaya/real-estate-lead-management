import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protege la aplicacion: sin sesion se va a /login y se guarda el destino
// para volver a el despues de entrar.
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// Impide volver al formulario de acceso con una sesion ya abierta.
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated ? router.createUrlTree(['/leads']) : true;
};
