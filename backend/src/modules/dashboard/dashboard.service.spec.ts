import { getDashboardSummary } from './dashboard.service';
import { seedAnexoA } from '../../test/fixtures';
import type { GroupCount } from './dashboard.types';

// Ordena los agrupamientos para comparar sin depender del orden, que el
// enunciado dice expresamente que no se evalua.
function asMap(groups: GroupCount[]): Record<string, number> {
  return Object.fromEntries(groups.map((g) => [g.label, g.count]));
}

describe('getDashboardSummary', () => {
  describe('con el dataset del Anexo A', () => {
    beforeEach(async () => {
      await seedAnexoA();
    });

    it('calcula los cuatro indicadores de control', async () => {
      const summary = await getDashboardSummary();

      expect(summary.totalLeads).toBe(10);
      expect(summary.averageBudget).toBe(174000);
      expect(summary.reservedLeads).toBe(2);
      expect(summary.conversionRate).toBe(20);
    });

    it('agrupa por estado', async () => {
      const { byStatus } = await getDashboardSummary();

      expect(asMap(byStatus)).toEqual({
        Nuevo: 2,
        Contactado: 2,
        Calificado: 3,
        Reservado: 2,
        Descartado: 1,
      });
    });

    it('agrupa por fuente', async () => {
      const { bySource } = await getDashboardSummary();

      expect(asMap(bySource)).toEqual({
        Facebook: 3,
        Instagram: 3,
        Website: 2,
        Referido: 2,
      });
    });

    it('agrupa por proyecto', async () => {
      const { byProject } = await getDashboardSummary();

      expect(asMap(byProject)).toEqual({
        'Residencial Altavista': 4,
        'Torres del Valle': 3,
        'Vista Verde': 3,
      });
    });

    it('mantiene la coherencia entre el total y cada agrupamiento', async () => {
      const summary = await getDashboardSummary();
      const sum = (groups: GroupCount[]): number =>
        groups.reduce((total, group) => total + group.count, 0);

      expect(sum(summary.byStatus)).toBe(summary.totalLeads);
      expect(sum(summary.bySource)).toBe(summary.totalLeads);
      expect(sum(summary.byProject)).toBe(summary.totalLeads);
    });
  });

  describe('con la coleccion vacia', () => {
    it('devuelve ceros en lugar de null o NaN', async () => {
      const summary = await getDashboardSummary();

      expect(summary).toEqual({
        totalLeads: 0,
        averageBudget: 0,
        reservedLeads: 0,
        conversionRate: 0,
        byStatus: [],
        bySource: [],
        byProject: [],
      });
      expect(Number.isNaN(summary.averageBudget)).toBe(false);
    });
  });
});
