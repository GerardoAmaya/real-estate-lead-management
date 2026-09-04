import type { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'leads' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  // La pantalla principal se carga de forma diferida y exige sesion.
  {
    path: 'leads',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/leads/pages/leads-dashboard/leads-dashboard.component').then(
        (m) => m.LeadsDashboardComponent,
      ),
  },
  { path: '**', redirectTo: 'leads' },
];
