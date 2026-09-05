import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideRouter,
  Router,
  UrlTree,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';

describe('guards de sesion', () => {
  let injector: EnvironmentInjector;
  let router: Router;

  const state = { url: '/leads?page=2' } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    localStorage.clear();
    // AuthService inyecta HttpClient aunque el guard solo mire el token.
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    injector = TestBed.inject(EnvironmentInjector);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('deja pasar a la aplicacion con sesion abierta', () => {
    localStorage.setItem('rel.accessToken', 'token-de-prueba');

    expect(runInInjectionContext(injector, () => authGuard(route, state))).toBe(true);
  });

  it('redirige al acceso y conserva el destino cuando no hay sesion', () => {
    const result = runInInjectionContext(injector, () => authGuard(route, state));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fleads%3Fpage%3D2');
  });

  it('impide volver al acceso con una sesion ya abierta', () => {
    localStorage.setItem('rel.accessToken', 'token-de-prueba');

    const result = runInInjectionContext(injector, () => guestGuard(route, state));

    expect(router.serializeUrl(result as UrlTree)).toBe('/leads');
  });

  it('permite ver el acceso sin sesion', () => {
    expect(runInInjectionContext(injector, () => guestGuard(route, state))).toBe(true);
  });
});
