import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleExclamation, faInbox } from '@fortawesome/free-solid-svg-icons';

// Cubre los estados "sin resultados" y "error" con una sola pieza.
@Component({
  selector: 'app-state-message',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span
        class="rounded-full p-3"
        [class]="variant === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'"
      >
        <fa-icon
          [icon]="variant === 'error' ? errorIcon : emptyIcon"
          size="lg"
          aria-hidden="true"
        />
      </span>

      <p class="text-sm font-medium text-slate-900">{{ title }}</p>
      <p *ngIf="description" class="max-w-md text-sm text-slate-500">{{ description }}</p>

      <button *ngIf="retryable" type="button" class="btn-secondary mt-1" (click)="retry.emit()">
        Reintentar
      </button>
    </div>
  `,
})
export class StateMessageComponent {
  @Input({ required: true }) title!: string;
  @Input() description?: string;
  @Input() variant: 'empty' | 'error' = 'empty';
  @Input() retryable = false;
  @Output() readonly retry = new EventEmitter<void>();

  protected readonly emptyIcon = faInbox;
  protected readonly errorIcon = faCircleExclamation;
}
