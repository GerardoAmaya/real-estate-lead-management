import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowRightFromBracket,
  faCircleUser,
  faChartLine,
  faCoins,
  faPlus,
  faUsers,
  faBookmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  type Observable,
} from 'rxjs';
import { LeadService } from '../../../../core/services/lead.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  DEFAULT_LEAD_QUERY,
  type CreateLeadPayload,
  type Lead,
  type LeadFilters,
  type LeadQuery,
  type LeadStatus,
  type PaginatedResponse,
  type SortableField,
} from '../../../../core/models/lead.model';
import type { DashboardSummary } from '../../../../core/models/dashboard.model';
import { KpiCardComponent } from '../../../../shared/components/kpi-card.component';
import { StateMessageComponent } from '../../../../shared/components/state-message.component';
import { LeadFiltersComponent } from '../../components/lead-filters.component';
import { LeadTableComponent } from '../../components/lead-table.component';
import { LeadPaginatorComponent } from '../../components/lead-paginator.component';
import { LeadFormDialogComponent } from '../../components/lead-form-dialog.component';
import { failure, loading, success, type ViewState } from './view-state';

@Component({
  selector: 'app-leads-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    // DialogModule aporta los providers de Dialog: en el CDK 16 no estan
    // disponibles en la raiz de la aplicacion.
    DialogModule,
    FontAwesomeModule,
    KpiCardComponent,
    StateMessageComponent,
    LeadFiltersComponent,
    LeadTableComponent,
    LeadPaginatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leads-dashboard.component.html',
})
export class LeadsDashboardComponent {
  private readonly leadService = inject(LeadService);
  private readonly dashboardService = inject(DashboardService);
  private readonly dialog = inject(Dialog);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly icons = {
    total: faUsers,
    budget: faCoins,
    conversion: faChartLine,
    reserved: faBookmark,
    add: faPlus,
    user: faCircleUser,
    logout: faArrowRightFromBracket,
  };

  // Unica fuente de verdad de la consulta: filtros, pagina y orden juntos.
  private readonly query = new BehaviorSubject<LeadQuery>({ ...DEFAULT_LEAD_QUERY });
  // Se emite para forzar una recarga sin cambiar la consulta.
  private readonly reload = new BehaviorSubject<void>(undefined);

  protected readonly currentQuery = signal<LeadQuery>({ ...DEFAULT_LEAD_QUERY });

  // El componente de filtros solo debe conocer los filtros, no la paginacion
  // ni el orden: asi lo que emite no puede contaminar el resto de la consulta.
  protected readonly currentFilters = computed<LeadFilters>(() => {
    const { status, source, project } = this.currentQuery();
    return {
      ...(status ? { status } : {}),
      ...(source ? { source } : {}),
      ...(project ? { project } : {}),
    };
  });
  protected readonly updatingId = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  // distinctUntilChanged evita repetir la misma peticion cuando el usuario
  // vuelve a elegir el valor que ya estaba seleccionado.
  protected readonly leads$: Observable<ViewState<PaginatedResponse<Lead>>> = combineLatest([
    this.query.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))),
    this.reload,
  ]).pipe(
    switchMap(([query]) =>
      this.leadService.list(query).pipe(
        map((response) => success(response)),
        catchError((error: Error) => of(failure<PaginatedResponse<Lead>>(error.message))),
        startWith(loading<PaginatedResponse<Lead>>()),
      ),
    ),
  );

  protected readonly summary$: Observable<ViewState<DashboardSummary>> = this.reload.pipe(
    switchMap(() =>
      this.dashboardService.getSummary().pipe(
        map((response) => success(response)),
        catchError((error: Error) => of(failure<DashboardSummary>(error.message))),
        startWith(loading<DashboardSummary>()),
      ),
    ),
    // El resumen lo consumen los KPI y el filtro de proyectos: sin compartir
    // la suscripcion, cada async pipe dispararia su propia peticion.
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  // Los proyectos del filtro salen del agregado, no de una lista fija.
  protected readonly projects$: Observable<string[]> = this.summary$.pipe(
    map((state) => (state.status === 'success' ? state.data.byProject.map((g) => g.label) : [])),
  );

  // Reemplaza la consulta completa. Es la unica forma de QUITAR un filtro:
  // con un spread las claves solo se sobrescriben, nunca se eliminan.
  private setQuery(next: LeadQuery): void {
    this.currentQuery.set(next);
    this.query.next(next);
  }

  // Para cambios que solo tocan claves siempre presentes (pagina, orden).
  private patchQuery(patch: Partial<LeadQuery>): void {
    this.setQuery({ ...this.query.value, ...patch });
  }

  protected onFiltersChange(filters: LeadFilters): void {
    const { limit, sortBy, sortOrder } = this.query.value;

    // Se parte de los valores por defecto para descartar los filtros anteriores,
    // conservando el orden y el tamano de pagina que eligio el usuario.
    // Cambiar un filtro vuelve a la primera pagina: la actual podria no existir.
    this.setQuery({ ...DEFAULT_LEAD_QUERY, limit, sortBy, sortOrder, ...filters, page: 1 });
  }

  protected onClearFilters(): void {
    // Limpiar devuelve la pantalla a su estado inicial completo.
    this.setQuery({ ...DEFAULT_LEAD_QUERY });
  }

  protected onPageChange(page: number): void {
    this.patchQuery({ page });
  }

  protected onSort(field: SortableField): void {
    const { sortBy, sortOrder } = this.query.value;
    const nextOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    this.patchQuery({ sortBy: field, sortOrder: nextOrder, page: 1 });
  }

  protected onCreateLead(): void {
    this.dialog
      .open<CreateLeadPayload | undefined>(LeadFormDialogComponent)
      .closed.subscribe((payload) => {
        if (!payload) return;

        this.actionError.set(null);
        this.leadService.create(payload).subscribe({
          next: (lead) => {
            void this.announcer.announce(`Lead ${lead.name} creado.`);
            this.reload.next();
          },
          error: (error: Error) => this.actionError.set(error.message),
        });
      });
  }

  protected onStatusChange({ lead, status }: { lead: Lead; status: LeadStatus }): void {
    this.actionError.set(null);
    this.updatingId.set(lead.id);

    this.leadService.updateStatus(lead.id, status).subscribe({
      next: () => {
        void this.announcer.announce(`Estado de ${lead.name} actualizado a ${status}.`);
        this.updatingId.set(null);
        this.reload.next();
      },
      error: (error: Error) => {
        this.actionError.set(error.message);
        this.updatingId.set(null);
        this.reload.next();
      },
    });
  }

  protected onLogout(): void {
    this.auth.logout();
    void this.announcer.announce('Sesion cerrada.');
    void this.router.navigate(['/login']);
  }

  protected onRetry(): void {
    this.reload.next();
  }
}
