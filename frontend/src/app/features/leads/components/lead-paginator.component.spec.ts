import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeadPaginatorComponent } from './lead-paginator.component';
import type { PaginationMeta } from '../../../core/models/lead.model';

const meta = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  page: 1,
  limit: 10,
  total: 25,
  totalPages: 3,
  hasNextPage: true,
  hasPreviousPage: false,
  ...overrides,
});

describe('LeadPaginatorComponent', () => {
  let fixture: ComponentFixture<LeadPaginatorComponent>;
  let component: LeadPaginatorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LeadPaginatorComponent] }).compileComponents();
    fixture = TestBed.createComponent(LeadPaginatorComponent);
    component = fixture.componentInstance;
  });

  it('calcula el rango de la primera pagina', () => {
    component.meta = meta();

    expect(component.from).toBe(1);
    expect(component.to).toBe(10);
  });

  it('calcula el rango de una pagina intermedia', () => {
    component.meta = meta({ page: 2, hasPreviousPage: true });

    expect(component.from).toBe(11);
    expect(component.to).toBe(20);
  });

  it('recorta el final en la ultima pagina incompleta', () => {
    component.meta = meta({ page: 3, hasNextPage: false, hasPreviousPage: true });

    expect(component.from).toBe(21);
    // 25 registros, no 30.
    expect(component.to).toBe(25);
  });

  it('muestra cero cuando no hay registros', () => {
    component.meta = meta({ total: 0, totalPages: 0, hasNextPage: false });

    expect(component.from).toBe(0);
    expect(component.to).toBe(0);
  });

  it('deshabilita anterior en la primera pagina', () => {
    component.meta = meta();
    fixture.detectChanges();

    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');

    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);
  });

  it('emite la pagina siguiente al pulsar', (done) => {
    component.meta = meta();
    fixture.detectChanges();

    component.pageChange.subscribe((page: number) => {
      expect(page).toBe(2);
      done();
    });

    (fixture.nativeElement as HTMLElement).querySelectorAll('button')[1].click();
  });
});
