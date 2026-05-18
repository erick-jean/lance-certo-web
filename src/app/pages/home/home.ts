import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { VehicleStatus } from '../vehicles/vehicles-data';
import { VEHICLE_STATUS_LABEL } from '../vehicles/vehicle-labels';

type SummaryCard = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone: 'total' | 'analysis' | 'purchased' | 'sold';
  helperTone?: 'warning' | 'success';
};

type RecentVehicle = {
  name: string;
  year: string;
  plate: string;
  status: Extract<VehicleStatus, 'ANALYZING' | 'PURCHASED'>;
  date: string;
  link: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly summaryCards: SummaryCard[] = [
    { label: 'Total de veículos', value: '2', helper: 'Atualizado agora', icon: 'directions_car', tone: 'total' },
    { label: 'Em análise', value: '1', helper: 'Aguardando', icon: 'pending_actions', tone: 'analysis', helperTone: 'warning' },
    { label: 'Arrematados', value: '1', helper: 'Sucesso', icon: 'gavel', tone: 'purchased', helperTone: 'success' },
    { label: 'Vendidos', value: '0', helper: 'Nenhum este mês', icon: 'sell', tone: 'sold' },
  ];

  protected readonly recentVehicles: RecentVehicle[] = [
    {
      name: 'Toyota Corolla XEI',
      year: '2021/2022',
      plate: 'ABC-1234',
      status: 'ANALYZING',
      date: '15/05/2024',
      link: '/veiculos/toyota-corolla-xei',
    },
    {
      name: 'Jeep Compass Longitude',
      year: '2020/2021',
      plate: 'XYZ-9876',
      status: 'PURCHASED',
      date: '10/05/2024',
      link: '/veiculos/jeep-compass-longitude',
    },
  ];

  protected statusLabel(status: RecentVehicle['status']): string {
    return VEHICLE_STATUS_LABEL[status];
  }
}
