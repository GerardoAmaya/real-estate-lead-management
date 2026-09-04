import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('no anade cabecera cuando no hay sesion', () => {
    http.get('/api/leads').subscribe();

    const request = httpMock.expectOne('/api/leads');

    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('adjunta el token como Bearer cuando hay sesion', () => {
    localStorage.setItem('rel.accessToken', 'token-de-prueba');
    // El servicio lee el token del almacenamiento en cada peticion.
    TestBed.inject(AuthService);

    http.get('/api/leads').subscribe();

    const request = httpMock.expectOne('/api/leads');

    expect(request.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    request.flush({});
  });
});
