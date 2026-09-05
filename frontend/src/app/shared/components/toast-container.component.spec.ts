import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ToastService } from '../services/toast.service';
import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  let fixture: ComponentFixture<ToastContainerComponent>;
  let service: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    service = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  function texto(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('no ocupa espacio mientras no hay avisos', () => {
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('p')).toHaveSize(0);
  });

  it('pinta el aviso y lo distingue por variante', fakeAsync(() => {
    service.error('No existe el lead');
    fixture.detectChanges();

    expect(texto()).toContain('No existe el lead');
    const aviso = (fixture.nativeElement as HTMLElement).querySelector('.toast-enter');
    expect(aviso?.className).toContain('bg-red-50');
    flush();
  }));

  it('lo quita al pulsar el boton de cerrar', fakeAsync(() => {
    service.success('Lead creado.');
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    fixture.detectChanges();

    expect(texto()).not.toContain('Lead creado.');
    expect(service.toasts()).toEqual([]);
    flush();
  }));

  // El contenedor se oculta a los lectores de pantalla porque LiveAnnouncer ya
  // anuncia el mismo mensaje: sin esto se leeria dos veces.
  it('queda fuera del arbol de accesibilidad', () => {
    const contenedor = (fixture.nativeElement as HTMLElement).querySelector('div');
    expect(contenedor?.getAttribute('aria-hidden')).toBe('true');
  });
});
