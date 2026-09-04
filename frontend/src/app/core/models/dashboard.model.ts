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
