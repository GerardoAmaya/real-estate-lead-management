import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilterCircleXmark } from '@fortawesome/free-solid-svg-icons';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadFilters,
  type LeadSource,
  type LeadStatus,
} from '../../../core/models/lead.model';

// Componente de presentacion: no consulta la API, solo emite los cambios.
@Component({
  selector: 'app-lead-filters',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card p-4" aria-label="Filtros de leads">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label class="field-label" for="filter-status">Estado</label>
          <select
            id="filter-status"
            class="field-input"
            [value]="filters.status ?? ''"
            (change)="emit('status', $any($event.target).value)"
          >
            <option value="">Todos</option>
            <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
          </select>
        </div>

        <div>
          <label class="field-label" for="filter-source">Fuente</label>
          <select
            id="filter-source"
            class="field-input"
            [value]="filters.source ?? ''"
            (change)="emit('source', $any($event.target).value)"
          >
            <option value="">Todas</option>
            <option *ngFor="let source of sources" [value]="source">{{ source }}</option>
          </select>
        </div>

        <div>
          <label class="field-label" for="filter-project">Proyecto</label>
          <select
            id="filter-project"
            class="field-input"
            [value]="filters.project ?? ''"
            (change)="emit('project', $any($event.target).value)"
          >
            <option value="">Todos</option>
            <option *ngFor="let project of projects" [value]="project">{{ project }}</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            type="button"
            class="btn-secondary w-full"
            [disabled]="!hasActiveFilters"
            (click)="clear.emit()"
          >
            <fa-icon [icon]="clearIcon" aria-hidden="true" />
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  `,
})
export class LeadFiltersComponent {
  @Input({ required: true }) filters!: LeadFilters;
  @Input() projects: string[] = [];

  @Output() readonly filtersChange = new EventEmitter<LeadFilters>();
  @Output() readonly clear = new EventEmitter<void>();

  protected readonly statuses = LEAD_STATUSES;
  protected readonly sources = LEAD_SOURCES;
  protected readonly clearIcon = faFilterCircleXmark;

  get hasActiveFilters(): boolean {
    return Boolean(this.filters.status ?? this.filters.source ?? this.filters.project);
  }

  // Cadena vacia significa "sin filtro": se elimina la clave en lugar de enviarla.
  protected emit(key: keyof LeadFilters, rawValue: string): void {
    const next: LeadFilters = { ...this.filters };

    if (rawValue === '') {
      delete next[key];
    } else if (key === 'status') {
      next.status = rawValue as LeadStatus;
    } else if (key === 'source') {
      next.source = rawValue as LeadSource;
    } else {
      next.project = rawValue;
    }

    this.filtersChange.emit(next);
  }
}
