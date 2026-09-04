import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faArrowDown, faArrowUp, faSort } from '@fortawesome/free-solid-svg-icons';
import { LeadTableComponent } from './lead-table.component';
import type { Lead, LeadStatus } from '../../../core/models/lead.model';

const LEAD: Lead = {
  id: '1',
  name: 'Carlos Mendoza',
  email: 'carlos@example.com',
  source: 'Facebook',
  status: 'Nuevo',
  budget: 145000,
  project: 'Residencial Altavista',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const SECOND_LEAD: Lead = { ...LEAD, id: '2', name: 'Maria Lopez', status: 'Reservado' };

describe('LeadTableComponent', () => {
  let fixture: ComponentFixture<LeadTableComponent>;
  let component: LeadTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LeadTableComponent] }).compileComponents();
    fixture = TestBed.createComponent(LeadTableComponent);
    component = fixture.componentInstance;
    // setInput marca el componente para revision: asignar la propiedad
    // directamente no lo hace, y con OnPush la plantilla no se actualizaria.
    fixture.componentRef.setInput('leads', [LEAD, SECOND_LEAD]);
    fixture.detectChanges();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('renderiza una fila por lead con sus datos', () => {
    const rows = element().querySelectorAll('tbody tr');
    const text = element().textContent ?? '';

    expect(rows).toHaveSize(2);
    expect(text).toContain('Carlos Mendoza');
    expect(text).toContain('carlos@example.com');
    expect(text).toContain('Residencial Altavista');
    expect(text).toContain('145,000');
  });

  it('marca con aria-sort la columna activa y deja el resto en none', () => {
    fixture.componentRef.setInput('sortBy', 'budget');
    fixture.componentRef.setInput('sortOrder', 'desc');
    fixture.detectChanges();

    const headers = Array.from(element().querySelectorAll('th[aria-sort]'));
    const byColumn = new Map(
      headers.map((h) => [h.textContent?.trim().split(' ')[0] ?? '', h.getAttribute('aria-sort')]),
    );

    expect(byColumn.get('Presupuesto')).toBe('descending');
    expect(byColumn.get('Creado')).toBe('none');
  });

  it('refleja el sentido ascendente en aria-sort', () => {
    fixture.componentRef.setInput('sortBy', 'budget');
    fixture.componentRef.setInput('sortOrder', 'asc');
    fixture.detectChanges();

    const header = element().querySelector('th[aria-sort="ascending"]');

    expect(header?.textContent).toContain('Presupuesto');
  });

  it('usa un icono distinto segun el sentido del orden', () => {
    fixture.componentRef.setInput('sortBy', 'budget');

    fixture.componentRef.setInput('sortOrder', 'asc');
    expect(component['sortIcon']('budget')).toBe(faArrowUp);

    fixture.componentRef.setInput('sortOrder', 'desc');
    expect(component['sortIcon']('budget')).toBe(faArrowDown);

    // Columna inactiva: icono neutro.
    expect(component['sortIcon']('createdAt')).toBe(faSort);
  });

  it('emite el ordenamiento al pulsar una cabecera', (done) => {
    component.sort.subscribe((field: string) => {
      expect(field).toBe('budget');
      done();
    });

    element().querySelector<HTMLButtonElement>('th button')!.click();
  });

  it('emite el cambio de estado solo si el valor es distinto', () => {
    const emitted: LeadStatus[] = [];
    component.statusChange.subscribe(({ status }) => emitted.push(status));

    component['onStatusChange'](LEAD, 'Reservado');
    // Seleccionar el mismo estado no debe generar una peticion.
    component['onStatusChange'](LEAD, 'Nuevo');

    expect(emitted).toEqual(['Reservado']);
  });

  it('deshabilita unicamente el selector de la fila que se esta actualizando', () => {
    fixture.componentRef.setInput('updatingId', '1');
    fixture.detectChanges();

    const selects = element().querySelectorAll<HTMLSelectElement>('tbody select');

    expect(selects[0].disabled).toBe(true);
    expect(selects[1].disabled).toBe(false);
  });

  it('preselecciona el estado actual de cada lead', () => {
    const selects = element().querySelectorAll<HTMLSelectElement>('tbody select');

    expect(selects[0].value).toBe('Nuevo');
    expect(selects[1].value).toBe('Reservado');
  });
});
