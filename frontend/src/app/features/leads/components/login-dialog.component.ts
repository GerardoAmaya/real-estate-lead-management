import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="w-[min(24rem,92vw)] rounded-lg bg-white shadow-xl"
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <header class="border-b border-slate-200 px-5 py-4">
        <h2 id="login-title" class="text-base font-semibold text-slate-900">Iniciar sesion</h2>
        <p class="mt-1 text-sm text-slate-500">Requerido para crear o actualizar leads.</p>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 px-5 py-4" novalidate>
        <div>
          <label class="field-label" for="login-email">Correo</label>
          <input id="login-email" class="field-input" formControlName="email" autocomplete="username" />
        </div>

        <div>
          <label class="field-label" for="login-password">Contrasena</label>
          <input
            id="login-password"
            type="password"
            class="field-input"
            formControlName="password"
            autocomplete="current-password"
          />
        </div>

        <p *ngIf="error()" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {{ error() }}
        </p>

        <footer class="flex justify-end gap-2 pt-1">
          <button type="button" class="btn-secondary" (click)="close()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </footer>
      </form>
    </div>
  `,
})
export class LoginDialogComponent {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  protected close(): void {
    this.dialogRef.close(false);
  }
}
