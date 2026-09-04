import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeadFiltersComponent } from './lead-filters.component';
import type { LeadFilters } from '../../../core/models/lead.model';

describe('LeadFiltersComponent', () => {
  let fixture: ComponentFixture<LeadFiltersComponent>;
  let component: LeadFiltersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LeadFiltersComponent] }).compileComponents();
    fixture = TestBed.createComponent(LeadFiltersComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('filters', {});
    fixture.componentRef.setInput('projects', ['Vista Verde', 'Torres del Valle']);
    fixture.detectChanges();
  });

  function selectValue(id: string, value: string): void {
    const select = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>(id);
    select!.value = value;
    select!.dispatchEvent(new Event('change'));
  }

  it('emite el filtro seleccionado', (done) => {
    component.filtersChange.subscribe((filters: LeadFilters) => {
      expect(filters.status).toBe('Reservado');
      done();
    });

    selectValue('#filter-status', 'Reservado');
  });

  it('elimina la clave al volver a "todos" en lugar de enviarla vacia', (done) => {
    fixture.componentRef.setInput('filters', { status: 'Reservado' });
    fixture.detectChanges();

    component.filtersChange.subscribe((filters: LeadFilters) => {
      expect('status' in filters).toBe(false);
      done();
    });

    selectValue('#filter-status', '');
  });

  it('deshabilita el boton de limpiar cuando no hay filtros activos', () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');

    expect(component.hasActiveFilters).toBe(false);
    expect(button?.disabled).toBe(true);
  });

  it('habilita el boton de limpiar con filtros activos', () => {
    fixture.componentRef.setInput('filters', { source: 'Facebook' });
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');

    expect(component.hasActiveFilters).toBe(true);
    expect(button?.disabled).toBe(false);
  });

  it('refleja en el desplegable el filtro activo', () => {
    fixture.componentRef.setInput('filters', { status: 'Reservado', source: 'Facebook' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector<HTMLSelectElement>('#filter-status');
    const source = element.querySelector<HTMLSelectElement>('#filter-source');

    // Si la seleccion no se marca en la opcion, el select cae a la primera.
    expect(status?.value).toBe('Reservado');
    expect(source?.value).toBe('Facebook');
  });

  it('vuelve a "todos" cuando no hay filtro aplicado', () => {
    fixture.componentRef.setInput('filters', {});
    fixture.detectChanges();

    const status = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>(
      '#filter-status',
    );

    expect(status?.value).toBe('');
  });

  it('emite el proyecto seleccionado', (done) => {
    component.filtersChange.subscribe((filters: LeadFilters) => {
      expect(filters.project).toBe('Vista Verde');
      done();
    });

    selectValue('#filter-project', 'Vista Verde');
  });

  it('emite el evento de limpiar al pulsar el boton', () => {
    let cleared = 0;
    fixture.componentRef.setInput('filters', { source: 'Facebook' });
    fixture.detectChanges();
    component.clear.subscribe(() => (cleared += 1));

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(cleared).toBe(1);
  });

  it('lista los proyectos recibidos', () => {
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '#filter-project option',
    );

    // Los dos proyectos mas la opcion "Todos".
    expect(options).toHaveSize(3);
  });
});
