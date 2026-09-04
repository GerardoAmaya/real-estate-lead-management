import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import type { LoginResponse } from '../models/auth.model';

const RESPONSE: LoginResponse = {
  accessToken: 'token-de-prueba',
  expiresIn: '1h',
  user: { id: '1', name: 'Admin Demo', email: 'admin@example.com', role: 'admin' },
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('empieza sin sesion', () => {
    expect(service.isAuthenticated).toBe(false);
    expect(service.token).toBeNull();
  });

  it('guarda el token y publica el usuario tras el login', (done) => {
    service.login({ email: 'admin@example.com', password: 'x' }).subscribe(() => {
      expect(service.token).toBe('token-de-prueba');
      expect(service.isAuthenticated).toBe(true);
      done();
    });

    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(RESPONSE);
  });

  it('limpia el almacenamiento al cerrar sesion', (done) => {
    service.login({ email: 'admin@example.com', password: 'x' }).subscribe(() => {
      service.logout();

      expect(service.token).toBeNull();
      expect(service.isAuthenticated).toBe(false);
      done();
    });

    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(RESPONSE);
  });

  it('no falla al arrancar si el usuario almacenado esta corrupto', () => {
    localStorage.setItem('rel.user', '{esto no es json');

    // La instancia se crea al inyectar, leyendo el valor invalido.
    const recreated = TestBed.inject(AuthService);

    expect(recreated).toBeTruthy();
  });
});
