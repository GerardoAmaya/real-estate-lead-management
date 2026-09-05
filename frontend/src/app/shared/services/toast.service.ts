import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error';

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}

// Los avisos se cierran solos: informan el resultado de una accion, no
// requieren decision del usuario.
export const TOAST_DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<Toast[]>([]);
  private lastId = 0;

  readonly toasts = this.items.asReadonly();

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((toast) => toast.id !== id));
  }

  private push(variant: ToastVariant, message: string): void {
    const id = ++this.lastId;
    this.items.update((list) => [...list, { id, variant, message }]);
    setTimeout(() => this.dismiss(id), TOAST_DURATION_MS);
  }
}
