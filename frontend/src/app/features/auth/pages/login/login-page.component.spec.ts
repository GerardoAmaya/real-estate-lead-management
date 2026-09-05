import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { errorInterceptor } from '../../../../core/interceptors/error.interceptor';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const loginUrl = `${environment.apiUrl}/auth/login`;
  const RESPONSE = {
    accessToken: 'token-de-prueba',
    expiresIn: '1h',
    user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' as const },
  };

  async function setup(returnUrl: string | null = null): Promise<void> {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        // El interceptor de errores es el que traduce el 401 a un mensaje legible.
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  // Enviar por el DOM y no llamando al metodo: markAllAsTouched no es una
  // senal, asi que sin el evento real la vista OnPush no se repinta.
  function submitForm(): void {
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    form?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  beforeEach(() => localStorage.clear());

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('no envia nada y muestra los mensajes con el formulario vacio', async () => {
    await setup();

    submitForm();

    expect(httpMock.match(loginUrl)).toHaveSize(0);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('El correo es obligatorio.');
    expect(text).toContain('La contraseña es obligatoria.');
  });

  it('rechaza un correo con formato invalido antes de llamar a la API', async () => {
    await setup();

    fixture.componentInstance['form'].setValue({ email: 'no-es-correo', password: 'Admin123!' });
    submitForm();

    expect(httpMock.match(loginUrl)).toHaveSize(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'El correo no tiene un formato valido.',
    );
  });

  it('guarda la sesion y entra al listado', async () => {
    await setup();

    fixture.componentInstance['useDemoCredentials']();
    submitForm();

    const request = httpMock.expectOne(loginUrl);
    expect(request.request.body).toEqual({
      email: 'admin@example.com',
      password: 'Admin123!',
    });
    request.flush(RESPONSE);

    expect(localStorage.getItem('rel.accessToken')).toBe('token-de-prueba');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/leads');
  });

  it('vuelve al destino que pidio el guard', async () => {
    await setup('/leads?page=2');

    fixture.componentInstance['useDemoCredentials']();
    submitForm();
    httpMock.expectOne(loginUrl).flush(RESPONSE);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/leads?page=2');
  });

  it('alterna la visibilidad de la contraseña', async () => {
    await setup();

    const campo = (fixture.nativeElement as HTMLElement).querySelector('#password');
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '#password ~ button, .relative button',
    );

    expect(campo?.getAttribute('type')).toBe('password');

    boton?.click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#password')?.getAttribute('type'),
    ).toBe('text');

    boton?.click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#password')?.getAttribute('type'),
    ).toBe('password');
  });

  it('muestra el mensaje de la API y no navega cuando las credenciales fallan', async () => {
    await setup();

    fixture.componentInstance['useDemoCredentials']();
    submitForm();

    httpMock.expectOne(loginUrl).flush(
      {
        error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales invalidas', timestamp: '' },
      },
      { status: 401, statusText: 'Unauthorized' },
    );
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Credenciales invalidas');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(localStorage.getItem('rel.accessToken')).toBeNull();
    // El boton vuelve a estar disponible para reintentar.
    expect(fixture.componentInstance['loading']()).toBe(false);
  });
});
