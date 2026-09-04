import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { LeadStatus } from '../../core/models/lead.model';

// El color no es el unico portador de significado: el texto siempre esta.
const STATUS_CLASSES: Record<LeadStatus, string> = {
  Nuevo: 'bg-slate-100 text-slate-700 ring-slate-200',
  Contactado: 'bg-blue-50 text-blue-700 ring-blue-200',
  Calificado: 'bg-amber-50 text-amber-700 ring-amber-200',
  Reservado: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Descartado: 'bg-red-50 text-red-700 ring-red-200',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
      [class]="classes"
    >
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: LeadStatus;

  get classes(): string {
    return STATUS_CLASSES[this.status];
  }
}
