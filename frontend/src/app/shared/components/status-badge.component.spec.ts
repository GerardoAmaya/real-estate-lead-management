import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';
import { LEAD_STATUSES } from '../../core/models/lead.model';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  it('muestra el texto del estado, no solo un color', () => {
    fixture.componentInstance.status = 'Reservado';
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Reservado');
  });

  it('asigna clases distintas a cada estado', () => {
    const classes = LEAD_STATUSES.map((status) => {
      fixture.componentInstance.status = status;
      return fixture.componentInstance.classes;
    });

    expect(new Set(classes).size).toBe(LEAD_STATUSES.length);
  });

  it('define un estilo para todos los estados del dominio', () => {
    for (const status of LEAD_STATUSES) {
      fixture.componentInstance.status = status;

      expect(fixture.componentInstance.classes).toBeTruthy();
    }
  });
});
