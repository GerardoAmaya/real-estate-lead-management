import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { authInterceptor } from '../../../../core/interceptors/auth.interceptor';
import { errorInterceptor } from '../../../../core/interceptors/error.interceptor';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LeadsDashboardComponent } from './leads-dashboard.component';
import { environment } from '../../../../../environments/environment';
import type { Lead, PaginatedResponse } from '../../../../core/models/lead.model';
import type { DashboardSummary } from '../../../../core/models/dashboard.model';

const LEAD: Lead = {
  id: '1',
  name: 'Carlos Mendoza',
  email: 'carlos@example.com',
  source: 'Facebook',
  status: 'Nuevo',
  budget: 145000,
  project: 'Residencial Altavista',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const PAGE: PaginatedResponse<Lead> = {
  data: [LEAD],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
};

const EMPTY_PAGE: PaginatedResponse<Lead> = {
  data: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
};

const SUMMARY: DashboardSummary = {
  totalLeads: 10,
  averageBudget: 174000,
  reservedLeads: 2,
  conversionRate: 20,
  byStatus: [{ label: 'Nuevo', count: 2 }],
  bySource: [{ label: 'Facebook', count: 3 }],
  byProject: [
    { label: 'Residencial Altavista', count: 4 },
    { label: 'Vista Verde', count: 3 },
  ],
};

describe('LeadsDashboardComponent', () => {
  let fixture: ComponentFixture<LeadsDashboardComponent>;
  let httpMock: HttpTestingController;

  const leadsUrl = `${environment.apiUrl}/leads`;
  const summaryUrl = `${environment.apiUrl}/dashboard/summary`;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LeadsDashboardComponent, HttpClientTestingModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsDashboardComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Resuelve la carga inicial: un listado y un resumen.
  function resolveInitialLoad(page: PaginatedResponse<Lead> = PAGE): void {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === leadsUrl).flush(page);
    httpMock.expectOne(summaryUrl).flush(SUMMARY);
    fixture.detectChanges();
  }

  it('muestra el estado de carga antes de que respondan las peticiones', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[aria-busy="true"]')).toBeTruthy();

    httpMock.expectOne((r) => r.url === leadsUrl).flush(PAGE);
    httpMock.expectOne(summaryUrl).flush(SUMMARY);
  });

  it('renderiza los indicadores y la tabla al recibir datos', () => {
    resolveInitialLoad();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('174,000');
    expect(text).toContain('20%');
    expect(text).toContain('Carlos Mendoza');
  });

  it('muestra el estado sin resultados cuando la lista viene vacia', () => {
    resolveInitialLoad(EMPTY_PAGE);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay leads que coincidan',
    );
  });

  it('muestra el estado de error cuando falla el listado', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === leadsUrl)
      .flush({ error: { code: 'INTERNAL_ERROR', message: 'Fallo el servidor', timestamp: '' } },
        { status: 500, statusText: 'Server Error' });
    httpMock.expectOne(summaryUrl).flush(SUMMARY);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No se pudieron cargar los leads',
    );
  });

  it('consulta al backend al cambiar un filtro y vuelve a la primera pagina', () => {
    resolveInitialLoad();

    fixture.componentInstance['onFiltersChange']({ status: 'Reservado' });
    fixture.detectChanges();

    const request = httpMock.expectOne((r) => r.url === leadsUrl);

    expect(request.request.params.get('status')).toBe('Reservado');
    expect(request.request.params.get('page')).toBe('1');
    request.flush(PAGE);
  });

  it('no repite la peticion si la consulta no cambia', fakeAsync(() => {
    resolveInitialLoad();

    // Mismo filtro dos veces seguidas: solo debe viajar una peticion.
    fixture.componentInstance['onFiltersChange']({ source: 'Facebook' });
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === leadsUrl).flush(PAGE);

    fixture.componentInstance['onFiltersChange']({ source: 'Facebook' });
    fixture.detectChanges();
    tick();

    // match() devuelve las peticiones pendientes: debe estar vacio.
    expect(httpMock.match((r) => r.url === leadsUrl)).toHaveSize(0);
  }));

  it('alterna el sentido del ordenamiento al pulsar la misma columna', () => {
    resolveInitialLoad();

    fixture.componentInstance['onSort']('budget');
    fixture.detectChanges();
    const first = httpMock.expectOne((r) => r.url === leadsUrl);

    expect(first.request.params.get('sortBy')).toBe('budget');
    expect(first.request.params.get('sortOrder')).toBe('desc');
    first.flush(PAGE);

    fixture.componentInstance['onSort']('budget');
    fixture.detectChanges();
    const second = httpMock.expectOne((r) => r.url === leadsUrl);

    expect(second.request.params.get('sortOrder')).toBe('asc');
    second.flush(PAGE);
  });

  it('elimina el filtro al volver a "todos", en lugar de conservarlo', () => {
    resolveInitialLoad();

    fixture.componentInstance['onFiltersChange']({ status: 'Reservado' });
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === leadsUrl).flush(PAGE);

    // Deseleccionar deja el objeto de filtros vacio.
    fixture.componentInstance['onFiltersChange']({});
    fixture.detectChanges();
    const request = httpMock.expectOne((r) => r.url === leadsUrl);

    expect(request.request.params.has('status')).toBe(false);
    request.flush(PAGE);
  });

  it('devuelve la consulta a su estado inicial al limpiar los filtros', () => {
    resolveInitialLoad();

    fixture.componentInstance['onFiltersChange']({ status: 'Reservado', source: 'Facebook' });
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === leadsUrl).flush(PAGE);

    fixture.componentInstance['onSort']('budget');
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === leadsUrl).flush(PAGE);

    fixture.componentInstance['onClearFilters']();
    fixture.detectChanges();
    const request = httpMock.expectOne((r) => r.url === leadsUrl);

    expect(request.request.params.has('status')).toBe(false);
    expect(request.request.params.has('source')).toBe(false);
    expect(request.request.params.get('page')).toBe('1');
    // Limpiar restaura tambien el orden por defecto.
    expect(request.request.params.get('sortBy')).toBe('createdAt');
    expect(request.request.params.get('sortOrder')).toBe('desc');
    request.flush(PAGE);
  });

  it('conserva el orden elegido al cambiar de filtro', () => {
    resolveInitialLoad();

    fixture.componentInstance['onSort']('budget');
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === leadsUrl).flush(PAGE);

    fixture.componentInstance['onFiltersChange']({ source: 'Facebook' });
    fixture.detectChanges();
    const request = httpMock.expectOne((r) => r.url === leadsUrl);

    expect(request.request.params.get('sortBy')).toBe('budget');
    expect(request.request.params.get('source')).toBe('Facebook');
    request.flush(PAGE);
  });

  it('expone a los filtros solo los filtros, sin paginacion ni orden', () => {
    resolveInitialLoad();

    fixture.componentInstance['onFiltersChange']({ status: 'Reservado' });
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === leadsUrl).flush(PAGE);

    const filters = fixture.componentInstance['currentFilters']();

    expect(filters).toEqual({ status: 'Reservado' });
    expect('page' in filters).toBe(false);
    expect('sortBy' in filters).toBe(false);
  });

  it('alimenta el filtro de proyectos desde el agregado del dashboard', (done) => {
    resolveInitialLoad();

    fixture.componentInstance['projects$'].subscribe((projects: string[]) => {
      expect(projects).toEqual(['Residencial Altavista', 'Vista Verde']);
      done();
    });
  });

  it('vuelve a consultar al reintentar tras un error', () => {
    resolveInitialLoad();

    fixture.componentInstance['onRetry']();
    fixture.detectChanges();

    expect(httpMock.match((r) => r.url === leadsUrl)).toHaveSize(1);
    httpMock.match((r) => r.url === summaryUrl).forEach((r) => r.flush(SUMMARY));
  });
});

describe('LeadsDashboardComponent · acciones con dialogo', () => {
  let fixture: ComponentFixture<LeadsDashboardComponent>;
  let httpMock: HttpTestingController;
  let dialog: jasmine.SpyObj<Dialog>;

  const leadsUrl = `${environment.apiUrl}/leads`;
  const summaryUrl = `${environment.apiUrl}/dashboard/summary`;

  const NEW_LEAD = {
    name: 'Ana Portillo',
    email: 'ana@example.com',
    source: 'Website' as const,
    budget: 180000,
    project: 'Vista Verde',
  };

  beforeEach(async () => {
    localStorage.clear();
    // Con token en el almacenamiento no se abre el dialogo de login.
    localStorage.setItem('rel.accessToken', 'token-de-prueba');

    dialog = jasmine.createSpyObj<Dialog>('Dialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [LeadsDashboardComponent, NoopAnimationsModule],
      providers: [
        // Se registran los mismos interceptores que app.config.ts: sin ellos
        // los errores llegarian crudos y el test probaria otra aplicacion.
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        // El anunciador real programa temporizadores que fakeAsync no perdona.
        { provide: LiveAnnouncer, useValue: { announce: () => Promise.resolve() } },
      ],
    })
      // DialogModule aporta Dialog en el inyector del componente, que tiene
      // prioridad sobre el de TestBed: hay que sustituirlo en ese nivel.
      .overrideComponent(LeadsDashboardComponent, {
        add: { providers: [{ provide: Dialog, useValue: dialog }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LeadsDashboardComponent);
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === leadsUrl).flush(PAGE);
    httpMock.expectOne(summaryUrl).flush(SUMMARY);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function drainPendingRequests(): void {
    httpMock.match((r) => r.url === leadsUrl).forEach((r) => r.flush(PAGE));
    httpMock.match((r) => r.url === summaryUrl).forEach((r) => r.flush(SUMMARY));
  }

  it('crea el lead y recarga listado e indicadores', fakeAsync(() => {
    dialog.open.and.returnValue({ closed: of(NEW_LEAD) } as ReturnType<Dialog['open']>);

    void fixture.componentInstance['onCreateLead']();
    tick();

    const post = httpMock.expectOne((r) => r.url === leadsUrl && r.method === 'POST');

    expect(post.request.body).toEqual(NEW_LEAD);
    post.flush({ ...LEAD, ...NEW_LEAD });
    fixture.detectChanges();

    // La recarga vuelve a pedir listado y resumen.
    expect(httpMock.match((r) => r.url === summaryUrl)).toHaveSize(1);
    drainPendingRequests();
  }));

  it('no envia nada si se cancela el dialogo de creacion', fakeAsync(() => {
    dialog.open.and.returnValue({ closed: of(undefined) } as ReturnType<Dialog['open']>);

    void fixture.componentInstance['onCreateLead']();
    tick();

    httpMock.expectNone((r) => r.method === 'POST');
    expect(fixture.componentInstance['actionError']()).toBeNull();
  }));

  it('muestra el error devuelto por la API si la creacion falla', fakeAsync(() => {
    dialog.open.and.returnValue({ closed: of(NEW_LEAD) } as ReturnType<Dialog['open']>);

    void fixture.componentInstance['onCreateLead']();
    tick();

    httpMock
      .expectOne((r) => r.url === leadsUrl && r.method === 'POST')
      .flush(
        { error: { code: 'VALIDATION_ERROR', message: 'Datos invalidos', timestamp: '' } },
        { status: 400, statusText: 'Bad Request' },
      );
    fixture.detectChanges();

    expect(fixture.componentInstance['actionError']()).toBe('Datos invalidos');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Datos invalidos');
  }));

  it('actualiza el estado y limpia el indicador de fila en curso', fakeAsync(() => {
    void fixture.componentInstance['onStatusChange']({ lead: LEAD, status: 'Reservado' });
    tick();

    const patch = httpMock.expectOne((r) => r.method === 'PATCH');

    expect(patch.request.url).toBe(`${leadsUrl}/${LEAD.id}/status`);
    expect(patch.request.body).toEqual({ status: 'Reservado' });
    // Mientras viaja la peticion, la fila queda marcada.
    expect(fixture.componentInstance['updatingId']()).toBe(LEAD.id);

    patch.flush({ ...LEAD, status: 'Reservado' });
    fixture.detectChanges();

    expect(fixture.componentInstance['updatingId']()).toBeNull();
    drainPendingRequests();
  }));

  it('recarga y muestra el error si la actualizacion de estado falla', fakeAsync(() => {
    void fixture.componentInstance['onStatusChange']({ lead: LEAD, status: 'Reservado' });
    tick();

    httpMock
      .expectOne((r) => r.method === 'PATCH')
      .flush(
        { error: { code: 'NOT_FOUND', message: 'No existe el lead', timestamp: '' } },
        { status: 404, statusText: 'Not Found' },
      );
    fixture.detectChanges();

    expect(fixture.componentInstance['actionError']()).toBe('No existe el lead');
    // La fila deja de estar bloqueada aunque haya fallado.
    expect(fixture.componentInstance['updatingId']()).toBeNull();
    drainPendingRequests();
  }));

  it('cierra la sesion y deja de exponer el token', () => {
    fixture.componentInstance['onLogout']();

    expect(fixture.componentInstance['auth'].isAuthenticated).toBe(false);
    expect(localStorage.getItem('rel.accessToken')).toBeNull();
  });
});
