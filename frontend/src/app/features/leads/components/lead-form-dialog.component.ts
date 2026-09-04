import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, type FormControl } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  type CreateLeadPayload,
} from '../../../core/models/lead.model';

interface LeadFormControls {
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  source: FormControl<string>;
  status: FormControl<string>;
  budget: FormControl<number | null>;
  project: FormControl<string>;
}

@Component({
  selector: 'app-lead-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, A11yModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="w-[min(32rem,92vw)] rounded-lg bg-white shadow-xl"
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-form-title"
    >
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 id="lead-form-title" class="text-base font-semibold text-slate-900">Nuevo lead</h2>
        <button type="button" class="text-slate-400 hover:text-slate-600" (click)="close()">
          <span class="sr-only">Cerrar</span>
          <fa-icon [icon]="closeIcon" aria-hidden="true" />
        </button>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 px-5 py-4" novalidate>
        <div>
          <label class="field-label" for="lead-name">Nombre</label>
          <input id="lead-name" class="field-input" formControlName="name" autocomplete="off" />
          <p class="field-error" *ngIf="showError('name')">
            {{
              form.controls.name.hasError('required')
                ? 'El nombre es obligatorio.'
                : 'Debe tener al menos 2 caracteres.'
            }}
          </p>
        </div>

        <div>
          <label class="field-label" for="lead-email">Correo</label>
          <input id="lead-email" class="field-input" formControlName="email" autocomplete="off" />
          <p class="field-error" *ngIf="showError('email')">
            {{
              form.controls.email.hasError('required')
                ? 'El correo es obligatorio.'
                : 'El correo no tiene un formato valido.'
            }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="field-label" for="lead-phone">Telefono (opcional)</label>
            <input id="lead-phone" class="field-input" formControlName="phone" autocomplete="off" />
          </div>

          <div>
            <label class="field-label" for="lead-budget">Presupuesto</label>
            <input
              id="lead-budget"
              type="number"
              class="field-input"
              formControlName="budget"
              min="1"
            />
            <p class="field-error" *ngIf="showError('budget')">
              {{
                form.controls.budget.hasError('required')
                  ? 'El presupuesto es obligatorio.'
                  : 'Debe ser mayor que cero.'
              }}
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="field-label" for="lead-source">Fuente</label>
            <select id="lead-source" class="field-input" formControlName="source">
              <option *ngFor="let source of sources" [value]="source">{{ source }}</option>
            </select>
          </div>

          <div>
            <label class="field-label" for="lead-status">Estado</label>
            <select id="lead-status" class="field-input" formControlName="status">
              <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="field-label" for="lead-project">Proyecto</label>
          <input
            id="lead-project"
            class="field-input"
            formControlName="project"
            autocomplete="off"
          />
          <p class="field-error" *ngIf="showError('project')">El proyecto es obligatorio.</p>
        </div>

        <footer class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" (click)="close()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Crear lead</button>
        </footer>
      </form>
    </div>
  `,
})
export class LeadFormDialogComponent {
  private readonly dialogRef = inject<DialogRef<CreateLeadPayload | undefined>>(DialogRef);
  private readonly fb = inject(FormBuilder);

  protected readonly sources = LEAD_SOURCES;
  protected readonly statuses = LEAD_STATUSES;
  protected readonly closeIcon = faXmark;

  // Las validaciones replican las del backend para dar respuesta inmediata,
  // sin sustituirlas: la API sigue siendo la autoridad.
  protected readonly form = this.fb.nonNullable.group<LeadFormControls>({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    phone: this.fb.nonNullable.control(''),
    source: this.fb.nonNullable.control<string>(LEAD_SOURCES[0], Validators.required),
    status: this.fb.nonNullable.control<string>(LEAD_STATUSES[0], Validators.required),
    budget: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    project: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
  });

  protected showError(field: keyof LeadFormControls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { phone, budget, ...rest } = this.form.getRawValue();

    this.dialogRef.close({
      ...rest,
      budget: budget ?? 0,
      // El campo opcional no debe viajar vacio: el esquema estricto lo rechazaria.
      ...(phone.trim() ? { phone: phone.trim() } : {}),
    } as CreateLeadPayload);
  }

  protected close(): void {
    this.dialogRef.close(undefined);
  }
}
