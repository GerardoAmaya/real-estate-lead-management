import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ToastService, type ToastVariant } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- aria-hidden porque los mismos mensajes ya se anuncian con LiveAnnouncer:
         sin esto el lector de pantalla los leeria dos veces. -->
    <div
      class="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(23rem,calc(100vw-2rem))] flex-col gap-2"
      aria-hidden="true"
    >
      <div
        *ngFor="let toast of toasts()"
        class="toast-enter pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg"
        [ngClass]="styles[toast.variant]"
      >
        <fa-icon [icon]="icons[toast.variant]" class="mt-0.5 shrink-0" />
        <p class="flex-1 text-sm leading-snug">{{ toast.message }}</p>
        <button
          type="button"
          class="shrink-0 opacity-50 transition hover:opacity-100"
          (click)="dismiss(toast.id)"
        >
          <span class="sr-only">Cerrar aviso</span>
          <fa-icon [icon]="closeIcon" size="sm" />
        </button>
      </div>
    </div>
  `,
})
export class ToastContainerComponent {
  private readonly service = inject(ToastService);

  protected readonly toasts = this.service.toasts;

  protected readonly icons: Record<ToastVariant, typeof faCircleCheck> = {
    success: faCircleCheck,
    error: faCircleExclamation,
  };

  protected readonly styles: Record<ToastVariant, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
  };

  protected readonly closeIcon = faXmark;

  protected dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
