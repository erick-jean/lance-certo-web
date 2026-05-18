import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { VehicleStatus } from '../vehicles/vehicles-data';
import { VEHICLE_STATUS_LABEL } from '../vehicles/vehicle-labels';

import { Dashboard, DashboardSummary } from '../../core/services/dashboard';

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
  private readonly dashboardService = inject(Dashboard);

  summary = signal<DashboardSummary | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dashboardService
      .getSummary()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (summary) => {
          this.summary.set(summary);
        },
        error: (err) => {
          if (err.status === 401) {
            this.errorMessage.set('Sessão expirada. Faça login novamente.');
            return;
          }

          this.errorMessage.set('Erro ao carregar o dashboard.');
        },
      });
  }

  protected readonly summaryCards = computed<SummaryCard[]>(() => {
    const data = this.summary();

    if (!data) {
      return [];
    }

    return [
      {
        label: 'Total de veículos',
        value: String(data.totalVehicles),
        helper: 'Atualizado agora',
        icon: 'directions_car',
        tone: 'total',
      },
      {
        label: 'Em análise',
        value: String(data.analyzingVehicles),
        helper: 'Aguardando',
        icon: 'pending_actions',
        tone: 'analysis',
        helperTone: 'warning',
      },
      {
        label: 'Arrematados',
        value: String(data.purchasedVehicles),
        helper: 'Sucesso',
        icon: 'gavel',
        tone: 'purchased',
        helperTone: 'success',
      },
      {
        label: 'Vendidos',
        value: String(data.soldVehicles),
        helper: data.soldVehicles > 0 ? 'Veículos vendidos' : 'Nenhum este mês',
        icon: 'sell',
        tone: 'sold',
      },
    ];
  });

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
