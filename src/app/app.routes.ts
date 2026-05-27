import { Routes } from '@angular/router';

import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((component) => component.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((component) => component.RegisterComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'criar-conta',
    redirectTo: 'register',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/home/home').then((component) => component.Home),
    canActivate: [authGuard],
  },
  {
    path: 'veiculos',
    loadComponent: () =>
      import('./pages/vehicles/vehicles').then((component) => component.Vehicles),
    canActivate: [authGuard],
  },
  {
    path: 'veiculos/novo',
    loadComponent: () =>
      import('./pages/vehicle-create/vehicle-create').then((component) => component.VehicleCreate),
    canActivate: [authGuard],
  },
  {
    path: 'veiculos/:id/editar',
    loadComponent: () =>
      import('./pages/vehicle-edit/vehicle-edit').then((component) => component.VehicleEdit),
    canActivate: [authGuard],
  },
  {
    path: 'veiculos/:id',
    loadComponent: () =>
      import('./pages/vehicle-detail/vehicle-detail').then((component) => component.VehicleDetail),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/profile').then((component) => component.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'financeiro',
    loadComponent: () => import('./pages/finance/finance').then((component) => component.Finance),
    canActivate: [authGuard],
  },
  {
    path: 'assinatura',
    loadComponent: () =>
      import('./pages/subscription/subscription').then((component) => component.Subscription),
    canActivate: [authGuard],
  },
  {
    path: 'assinatura/premium',
    redirectTo: 'assinatura',
    pathMatch: 'full',
  },
  {
    path: 'configuracoes',
    loadComponent: () =>
      import('./pages/settings/settings').then((component) => component.Settings),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
