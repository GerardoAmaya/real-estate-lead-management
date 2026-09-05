import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, TOAST_DURATION_MS } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('acumula los avisos en orden y distingue la variante', () => {
    service.success('Lead creado.');
    service.error('No existe el lead');

    expect(service.toasts()).toEqual([
      jasmine.objectContaining({ variant: 'success', message: 'Lead creado.' }),
      jasmine.objectContaining({ variant: 'error', message: 'No existe el lead' }),
    ]);
  });

  it('cierra cada aviso cuando vence su tiempo, sin arrastrar los demas', fakeAsync(() => {
    service.success('Primero');
    tick(TOAST_DURATION_MS / 2);
    service.success('Segundo');

    tick(TOAST_DURATION_MS / 2);
    expect(service.toasts()).toEqual([jasmine.objectContaining({ message: 'Segundo' })]);

    tick(TOAST_DURATION_MS / 2);
    expect(service.toasts()).toEqual([]);
  }));

  it('permite cerrarlo antes de tiempo sin dejar temporizadores sueltos', fakeAsync(() => {
    service.error('Fallo la operacion');
    const [aviso] = service.toasts();

    service.dismiss(aviso.id);

    expect(service.toasts()).toEqual([]);
    // El temporizador pendiente no debe reventar al no encontrar el aviso.
    tick(TOAST_DURATION_MS);
    expect(service.toasts()).toEqual([]);
  }));
});
