import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { VehicleCreate } from './pages/vehicle-create/vehicle-create';
import { VehicleDetail } from './pages/vehicle-detail/vehicle-detail';
import { VehicleEdit } from './pages/vehicle-edit/vehicle-edit';
import { Vehicles } from './pages/vehicles/vehicles';
import { Profile } from './pages/profile/profile';
import { Finance } from './pages/finance/finance';
import { Subscription } from './pages/subscription/subscription';
import { Settings } from './pages/settings/settings';
import { Login } from './pages/login/login';
import { authGuard, loginGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    component: Home,
    canActivate: [authGuard],
  },
  {
    path: 'veiculos',
    component: Vehicles,
    canActivate: [authGuard],
  },
  {
    path: 'veiculos/novo',
    component: VehicleCreate,
    canActivate: [authGuard],
  },
  {
    path: 'veiculos/:id/editar',
    component: VehicleEdit,
    canActivate: [authGuard],
  },
  {
    path: 'veiculos/:id',
    component: VehicleDetail,
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    component: Profile,
    canActivate: [authGuard],
  },
  {
    path: 'financeiro',
    component: Finance,
    canActivate: [authGuard],
  },
  {
    path: 'assinatura',
    component: Subscription,
    canActivate: [authGuard],
  },
  {
    path: 'configuracoes',
    component: Settings,
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
