import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { PaginationMeta } from '../../../core/models/lead.model';

@Component({
  selector: 'app-lead-paginator',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3"
      aria-label="Paginación"
    >
      <p class="text-sm text-slate-600">
        Mostrando <span class="font-medium">{{ from }}</span> a
        <span class="font-medium">{{ to }}</span> de
        <span class="font-medium">{{ meta.total }}</span> leads
      </p>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn-secondary px-3 py-1.5"
          [disabled]="!meta.hasPreviousPage"
          (click)="pageChange.emit(meta.page - 1)"
        >
          <fa-icon [icon]="prevIcon" size="sm" aria-hidden="true" />
          Anterior
        </button>

        <span class="text-sm text-slate-600">
          Página {{ meta.page }} de {{ meta.totalPages || 1 }}
        </span>

        <button
          type="button"
          class="btn-secondary px-3 py-1.5"
          [disabled]="!meta.hasNextPage"
          (click)="pageChange.emit(meta.page + 1)"
        >
          Siguiente
          <fa-icon [icon]="nextIcon" size="sm" aria-hidden="true" />
        </button>
      </div>
    </nav>
  `,
})
export class LeadPaginatorComponent {
  @Input({ required: true }) meta!: PaginationMeta;
  @Output() readonly pageChange = new EventEmitter<number>();

  protected readonly prevIcon = faChevronLeft;
  protected readonly nextIcon = faChevronRight;

  get from(): number {
    return this.meta.total === 0 ? 0 : (this.meta.page - 1) * this.meta.limit + 1;
  }

  get to(): number {
    return Math.min(this.meta.page * this.meta.limit, this.meta.total);
  }
}
