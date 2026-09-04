import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeadService } from './lead.service';
import { environment } from '../../../environments/environment';
import { DEFAULT_LEAD_QUERY, type LeadQuery } from '../models/lead.model';

describe('LeadService', () => {
  let service: LeadService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/leads`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(LeadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Falla si quedo alguna peticion sin atender o de mas.
    httpMock.verify();
  });

  it('solicita el listado con los parametros por defecto', () => {
    service.list({ ...DEFAULT_LEAD_QUERY }).subscribe();

    const request = httpMock.expectOne((req) => req.url === baseUrl);

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('sortBy')).toBe('createdAt');
    expect(request.request.params.get('sortOrder')).toBe('desc');
    request.flush({ data: [], meta: {} });
  });

  it('incluye unicamente los filtros con valor', () => {
    const query: LeadQuery = { ...DEFAULT_LEAD_QUERY, status: 'Reservado', source: 'Facebook' };

    service.list(query).subscribe();

    const request = httpMock.expectOne((req) => req.url === baseUrl);

    expect(request.request.params.get('status')).toBe('Reservado');
    expect(request.request.params.get('source')).toBe('Facebook');
    // Un filtro vacio no debe viajar: la API rechaza parametros sin valor.
    expect(request.request.params.has('project')).toBe(false);
    request.flush({ data: [], meta: {} });
  });

  it('obtiene un lead por identificador', () => {
    service.getById('abc123').subscribe();

    const request = httpMock.expectOne(`${baseUrl}/abc123`);

    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('crea un lead enviando el cuerpo recibido', () => {
    const payload = {
      name: 'Ana',
      email: 'ana@example.com',
      source: 'Website' as const,
      budget: 1000,
      project: 'Vista Verde',
    };

    service.create(payload).subscribe();

    const request = httpMock.expectOne(baseUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });

  it('actualiza unicamente el estado', () => {
    service.updateStatus('abc123', 'Reservado').subscribe();

    const request = httpMock.expectOne(`${baseUrl}/abc123/status`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'Reservado' });
    request.flush({});
  });
});
