import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faArrowUp, faSort } from '@fortawesome/free-solid-svg-icons';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import {
  LEAD_STATUSES,
  type Lead,
  type LeadStatus,
  type SortOrder,
  type SortableField,
} from '../../../core/models/lead.model';

@Component({
  selector: 'app-lead-table',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <caption class="sr-only">
          Listado de leads inmobiliarios
        </caption>

        <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th scope="col" class="px-4 py-3 font-medium">Nombre</th>
            <th scope="col" class="px-4 py-3 font-medium">Correo</th>
            <th scope="col" class="px-4 py-3 font-medium">Fuente</th>
            <th scope="col" class="px-4 py-3 font-medium">Proyecto</th>

            <th scope="col" class="px-4 py-3 font-medium" [attr.aria-sort]="ariaSort('budget')">
              <button type="button" class="flex items-center gap-1.5" (click)="sort.emit('budget')">
                Presupuesto
                <fa-icon [icon]="sortIcon('budget')" size="sm" aria-hidden="true" />
              </button>
            </th>

            <th scope="col" class="px-4 py-3 font-medium">Estado</th>

            <th scope="col" class="px-4 py-3 font-medium" [attr.aria-sort]="ariaSort('createdAt')">
              <button
                type="button"
                class="flex items-center gap-1.5"
                (click)="sort.emit('createdAt')"
              >
                Creado
                <fa-icon [icon]="sortIcon('createdAt')" size="sm" aria-hidden="true" />
              </button>
            </th>

            <th scope="col" class="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr *ngFor="let lead of leads; trackBy: trackById" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium text-slate-900">{{ lead.name }}</td>
            <td class="px-4 py-3 text-slate-600">{{ lead.email }}</td>
            <td class="px-4 py-3 text-slate-600">{{ lead.source }}</td>
            <td class="px-4 py-3 text-slate-600">{{ lead.project }}</td>
            <td class="px-4 py-3 tabular-nums text-slate-900">
              {{ lead.budget | currency: 'USD' : 'symbol' : '1.0-0' }}
            </td>
            <td class="px-4 py-3"><app-status-badge [status]="lead.status" /></td>
            <td class="px-4 py-3 text-slate-600">{{ lead.createdAt | date: 'dd/MM/yyyy' }}</td>
            <td class="px-4 py-3 text-right">
              <label class="sr-only" [attr.for]="'status-' + lead.id">
                Cambiar estado de {{ lead.name }}
              </label>
              <select
                [id]="'status-' + lead.id"
                class="field-input w-40 py-1 text-xs"
                [value]="lead.status"
                [disabled]="updatingId === lead.id"
                (change)="onStatusChange(lead, $any($event.target).value)"
              >
                <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class LeadTableComponent {
  @Input() leads: Lead[] = [];
  @Input() sortBy: SortableField = 'createdAt';
  @Input() sortOrder: SortOrder = 'desc';
  // Deshabilita solo la fila que se esta actualizando, no la tabla entera.
  @Input() updatingId: string | null = null;

  @Output() readonly sort = new EventEmitter<SortableField>();
  @Output() readonly statusChange = new EventEmitter<{ lead: Lead; status: LeadStatus }>();

  protected readonly statuses = LEAD_STATUSES;

  protected trackById(_index: number, lead: Lead): string {
    return lead.id;
  }

  protected sortIcon(field: SortableField): typeof faSort {
    if (this.sortBy !== field) return faSort;
    return this.sortOrder === 'asc' ? faArrowUp : faArrowDown;
  }

  protected ariaSort(field: SortableField): 'ascending' | 'descending' | 'none' {
    if (this.sortBy !== field) return 'none';
    return this.sortOrder === 'asc' ? 'ascending' : 'descending';
  }

  protected onStatusChange(lead: Lead, status: string): void {
    if (status !== lead.status) this.statusChange.emit({ lead, status: status as LeadStatus });
  }
}
