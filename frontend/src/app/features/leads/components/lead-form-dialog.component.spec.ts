import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { LeadFormDialogComponent } from './lead-form-dialog.component';
import type { CreateLeadPayload } from '../../../core/models/lead.model';

describe('LeadFormDialogComponent', () => {
  let fixture: ComponentFixture<LeadFormDialogComponent>;
  let component: LeadFormDialogComponent;
  let dialogRef: jasmine.SpyObj<DialogRef<CreateLeadPayload | undefined>>;

  const VALID = {
    name: 'Ana Portillo',
    email: 'ana@example.com',
    phone: '',
    source: 'Website',
    status: 'Nuevo',
    budget: 180000,
    project: 'Vista Verde',
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<DialogRef<CreateLeadPayload | undefined>>('DialogRef', [
      'close',
    ]);

    await TestBed.configureTestingModule({
      imports: [LeadFormDialogComponent],
      providers: [{ provide: DialogRef, useValue: dialogRef }],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function form(): (typeof component)['form'] {
    return component['form'];
  }

  it('arranca invalido y con el estado por defecto', () => {
    expect(form().invalid).toBe(true);
    expect(form().controls.status.value).toBe('Nuevo');
    expect(form().controls.source.value).toBe('Facebook');
  });

  it('exige nombre, correo, presupuesto y proyecto', () => {
    expect(form().controls.name.hasError('required')).toBe(true);
    expect(form().controls.email.hasError('required')).toBe(true);
    expect(form().controls.budget.hasError('required')).toBe(true);
    expect(form().controls.project.hasError('required')).toBe(true);
    // El telefono es el unico opcional.
    expect(form().controls.phone.valid).toBe(true);
  });

  it('rechaza un correo con formato invalido', () => {
    form().controls.email.setValue('no-es-correo');

    expect(form().controls.email.hasError('email')).toBe(true);
  });

  it('rechaza un presupuesto menor o igual a cero', () => {
    form().controls.budget.setValue(0);

    expect(form().controls.budget.hasError('min')).toBe(true);
  });

  it('rechaza un nombre de un solo caracter', () => {
    form().controls.name.setValue('A');

    expect(form().controls.name.hasError('minlength')).toBe(true);
  });

  it('no cierra el dialogo ni envia nada si el formulario es invalido', () => {
    component['submit']();

    expect(dialogRef.close).not.toHaveBeenCalled();
    // Marcar como tocado hace visibles los mensajes de error.
    expect(form().controls.name.touched).toBe(true);
  });

  it('devuelve el payload sin el telefono cuando viene vacio', () => {
    form().setValue(VALID);

    component['submit']();

    const payload = dialogRef.close.calls.mostRecent().args[0] as CreateLeadPayload;

    expect(payload.name).toBe('Ana Portillo');
    expect(payload.budget).toBe(180000);
    // Un campo opcional vacio no debe viajar: el esquema estricto lo rechaza.
    expect('phone' in payload).toBe(false);
  });

  it('incluye el telefono recortado cuando tiene valor', () => {
    form().setValue({ ...VALID, phone: '  7000-1001  ' });

    component['submit']();

    const payload = dialogRef.close.calls.mostRecent().args[0] as CreateLeadPayload;

    expect(payload.phone).toBe('7000-1001');
  });

  it('cierra sin datos al cancelar', () => {
    component['close']();

    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('muestra el error solo despues de tocar el campo', () => {
    expect(component['showError']('name')).toBe(false);

    form().controls.name.markAsTouched();

    expect(component['showError']('name')).toBe(true);
  });

  it('deshabilita el envio mientras el formulario es invalido', () => {
    const submit = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    expect(submit?.disabled).toBe(true);
  });
});
