import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StateMessageComponent } from './state-message.component';

describe('StateMessageComponent', () => {
  let fixture: ComponentFixture<StateMessageComponent>;
  let component: StateMessageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StateMessageComponent] }).compileComponents();
    fixture = TestBed.createComponent(StateMessageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'No hay leads');
  });

  it('muestra el titulo y la descripcion', () => {
    fixture.componentRef.setInput('description', 'Ajuste los filtros');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('No hay leads');
    expect(text).toContain('Ajuste los filtros');
  });

  it('oculta el boton de reintentar salvo que se pida', () => {
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('button')).toBeNull();
  });

  it('emite el reintento al pulsar el boton', () => {
    let emitted = 0;
    fixture.componentRef.setInput('retryable', true);
    fixture.componentRef.setInput('variant', 'error');
    fixture.detectChanges();
    component.retry.subscribe(() => (emitted += 1));

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(emitted).toBe(1);
  });

  it('usa un icono distinto en la variante de error', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.detectChanges();

    const icon = (fixture.nativeElement as HTMLElement).querySelector('.text-red-600');

    expect(icon).not.toBeNull();
  });
});
