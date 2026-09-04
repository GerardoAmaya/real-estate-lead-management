import type { PipelineStage } from 'mongoose';
import { LeadModel } from '../leads/lead.model';
import type { DashboardSummary, FacetResult, GroupCount } from './dashboard.types';

// Sub-pipeline reutilizable: cuenta documentos agrupando por un campo.
function groupBy(field: string): PipelineStage.FacetPipelineStage[] {
  return [
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $project: { _id: 0, label: '$_id', count: 1 } },
    { $sort: { count: -1, label: 1 } },
  ];
}

// $facet resuelve los siete indicadores en un solo recorrido de la coleccion.
// Toda la agregacion ocurre en MongoDB: no se traen documentos a memoria.
const SUMMARY_PIPELINE: PipelineStage[] = [
  {
    $facet: {
      totals: [
        {
          $group: {
            _id: null,
            totalLeads: { $sum: 1 },
            averageBudget: { $avg: '$budget' },
            reservedLeads: {
              $sum: { $cond: [{ $eq: ['$status', 'Reservado'] }, 1, 0] },
            },
          },
        },
        { $project: { _id: 0 } },
      ],
      byStatus: groupBy('status'),
      bySource: groupBy('source'),
      byProject: groupBy('project'),
    },
  },
];

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [result] = await LeadModel.aggregate<FacetResult>(SUMMARY_PIPELINE).exec();

  // Coleccion vacia: $facet devuelve arreglos vacios, no un error.
  const totals = result?.totals[0] ?? { totalLeads: 0, averageBudget: null, reservedLeads: 0 };
  const { totalLeads, reservedLeads } = totals;

  const conversionRate = totalLeads === 0 ? 0 : round((reservedLeads / totalLeads) * 100);

  return {
    totalLeads,
    averageBudget: round(totals.averageBudget ?? 0),
    reservedLeads,
    conversionRate,
    byStatus: result?.byStatus ?? ([] as GroupCount[]),
    bySource: result?.bySource ?? ([] as GroupCount[]),
    byProject: result?.byProject ?? ([] as GroupCount[]),
  };
}
