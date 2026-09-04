import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'leads' },
  // La pantalla principal se carga de forma diferida.
  {
    path: 'leads',
    loadComponent: () =>
      import('./features/leads/pages/leads-dashboard/leads-dashboard.component').then(
        (m) => m.LeadsDashboardComponent,
      ),
  },
  { path: '**', redirectTo: 'leads' },
];
