import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateLeadPayload,
  Lead,
  LeadQuery,
  LeadStatus,
  PaginatedResponse,
} from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/leads`;

  // Solo se envian los filtros con valor: la API rechaza parametros vacios.
  private toParams(query: LeadQuery): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit)
      .set('sortBy', query.sortBy)
      .set('sortOrder', query.sortOrder);

    if (query.status) params = params.set('status', query.status);
    if (query.source) params = params.set('source', query.source);
    if (query.project) params = params.set('project', query.project);

    return params;
  }

  list(query: LeadQuery): Observable<PaginatedResponse<Lead>> {
    return this.http.get<PaginatedResponse<Lead>>(this.baseUrl, { params: this.toParams(query) });
  }

  getById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateLeadPayload): Observable<Lead> {
    return this.http.post<Lead>(this.baseUrl, payload);
  }

  updateStatus(id: string, status: LeadStatus): Observable<Lead> {
    return this.http.patch<Lead>(`${this.baseUrl}/${id}/status`, { status });
  }
}
