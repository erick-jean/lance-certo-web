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

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Home,
  },
  {
    path: 'veiculos',
    component: Vehicles,
  },
  {
    path: 'veiculos/novo',
    component: VehicleCreate,
  },
  {
    path: 'veiculos/:id/editar',
    component: VehicleEdit,
  },
  {
    path: 'veiculos/:id',
    component: VehicleDetail,
  },
  {
    path: 'perfil',
    component: Profile,
  },
  {
    path: 'financeiro',
    component: Finance,
  },
  {
    path: 'assinatura',
    component: Subscription,
  },
  {
    path: 'configuracoes',
    component: Settings,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
