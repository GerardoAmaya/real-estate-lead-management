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
    component.filters = {};
    component.projects = ['Vista Verde', 'Torres del Valle'];
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
    component.filters = { status: 'Reservado' };
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
    component.filters = { source: 'Facebook' };
    fixture.detectChanges();

    expect(component.hasActiveFilters).toBe(true);
  });

  it('lista los proyectos recibidos', () => {
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '#filter-project option',
    );

    // Los dos proyectos mas la opcion "Todos".
    expect(options.length).toBe(3);
  });
});
