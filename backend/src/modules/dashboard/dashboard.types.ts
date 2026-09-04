export interface GroupCount {
  label: string;
  count: number;
}

export interface DashboardSummary {
  totalLeads: number;
  averageBudget: number;
  reservedLeads: number;
  conversionRate: number;
  byStatus: GroupCount[];
  bySource: GroupCount[];
  byProject: GroupCount[];
}

// Forma cruda que devuelve $facet antes de aplanarla.
export interface FacetResult {
  totals: { totalLeads: number; averageBudget: number | null; reservedLeads: number }[];
  byStatus: GroupCount[];
  bySource: GroupCount[];
  byProject: GroupCount[];
}
