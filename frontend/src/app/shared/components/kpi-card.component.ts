import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-500">{{ label }}</p>

          <p *ngIf="!loading; else skeleton" class="mt-2 text-2xl font-semibold text-slate-900">
            {{ displayValue }}
          </p>

          <ng-template #skeleton>
            <div class="mt-2 h-8 w-24 animate-pulse rounded bg-slate-200"></div>
          </ng-template>
        </div>

        <span class="rounded-md bg-brand-50 p-2 text-brand-600">
          <fa-icon [icon]="icon" aria-hidden="true" />
        </span>
      </div>
    </article>
  `,
})
export class KpiCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) icon!: IconDefinition;
  @Input() value: number | null = null;
  @Input() loading = false;
  // 'currency' y 'percent' solo cambian el formato de presentacion.
  @Input() format: 'number' | 'currency' | 'percent' = 'number';

  get displayValue(): string {
    if (this.value === null) return '—';

    switch (this.format) {
      case 'currency':
        return this.value.toLocaleString('es-SV', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        });
      case 'percent':
        return `${this.value.toLocaleString('es-SV')}%`;
      default:
        return this.value.toLocaleString('es-SV');
    }
  }
}
