import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let fixture: ComponentFixture<KpiCardComponent>;
  let component: KpiCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpiCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
    component.label = 'Total de leads';
    component.icon = faUsers;
  });

  it('formatea un numero simple', () => {
    component.value = 10;

    expect(component.displayValue).toBe('10');
  });

  it('formatea moneda sin decimales', () => {
    component.value = 174000;
    component.format = 'currency';

    expect(component.displayValue).toContain('174,000');
  });

  it('formatea porcentaje', () => {
    component.value = 20;
    component.format = 'percent';

    expect(component.displayValue).toBe('20%');
  });

  it('muestra un guion cuando no hay valor', () => {
    component.value = null;

    expect(component.displayValue).toBe('—');
  });

  it('muestra el esqueleto mientras carga, en lugar del valor', () => {
    component.loading = true;
    component.value = 10;
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.animate-pulse')).toBeTruthy();
    expect(element.textContent).not.toContain('10');
  });
});
