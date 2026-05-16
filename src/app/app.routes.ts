import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { VehicleCreate } from './pages/vehicle-create/vehicle-create';
import { VehicleDetail } from './pages/vehicle-detail/vehicle-detail';
import { VehicleEdit } from './pages/vehicle-edit/vehicle-edit';
import { Vehicles } from './pages/vehicles/vehicles';

export const routes: Routes = [
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
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
