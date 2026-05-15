import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { VehicleDetail } from './pages/vehicle-detail/vehicle-detail';
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
    path: 'veiculos/:id',
    component: VehicleDetail,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
