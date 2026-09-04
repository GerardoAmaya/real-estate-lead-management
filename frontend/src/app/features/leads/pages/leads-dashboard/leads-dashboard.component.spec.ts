import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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

    httpMock.expectNone((r) => r.url === leadsUrl);
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
});
