import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { VehicleStatus } from '../vehicles/vehicles-data';
import { VEHICLE_STATUS_LABEL } from '../vehicles/vehicle-labels';

import { Dashboard, DashboardSummary } from '../../core/services/dashboard';
import { PaginationMeta, Vehicle, Vehicles } from '../../core/services/vehicles';
import { formatDate, formatPlate } from '../../core/utils/helpers';

type SummaryCard = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone: 'total' | 'analysis' | 'purchased' | 'sold';
  helperTone?: 'warning' | 'success';
};

type RecentVehicle = {
  id: string;
  name: string;
  year: string;
  plate: string;
  status: Extract<VehicleStatus, 'ANALYZING' | 'PURCHASED' | 'SOLD' | 'REJECTED'>;
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
  private readonly vehiclesService = inject(Vehicles);

  summary = signal<DashboardSummary | null>(null);
  summaryLoading = signal(false);
  recentVehiclesLoading = signal(true);
  errorMessage = signal('');
  // Keep the skeleton aligned with the dashboard's recent-vehicles fetch size.
  protected readonly loadingRows = [0, 1, 2, 3, 4];

  ngOnInit(): void {
    this.loadSummary();
    this.searchRecentVehicles();
  }

  loadSummary(): void {
    this.summaryLoading.set(true);
    this.errorMessage.set('');

    this.dashboardService
      .getSummary()
      .pipe(
        finalize(() => {
          this.summaryLoading.set(false);
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

  recentVehicles = signal<RecentVehicle[]>([]);
  pagination = signal<PaginationMeta | null>(null);

  searchRecentVehicles(): void {
    this.recentVehiclesLoading.set(true);

    this.vehiclesService
      .getVehicles({
        page: 1,
        limit: 5,
      })
      .pipe(
        finalize(() => {
          this.recentVehiclesLoading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          const allowedStatus: VehicleStatus[] = ['ANALYZING', 'PURCHASED'];

          const vehicles: RecentVehicle[] = response.data
            .filter((vehicle) => allowedStatus.includes(vehicle.status))
            .map((vehicle) => ({
              id: vehicle.id,
              name: [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Veiculo sem nome',
              year: [vehicle.yearManufacture, vehicle.yearModel].filter(Boolean).join('/') || '-',
              plate: formatPlate(vehicle.plate ?? ''),
              status: vehicle.status,
              date:
                vehicle.status === 'ANALYZING'
                  ? formatDate(vehicle.createdAt ?? new Date())
                  : formatDate(vehicle.purchasedAt || vehicle.createdAt || new Date()),
              link: `/veiculos/${vehicle.id}`,
            }));

          this.recentVehicles.set(vehicles);
        },
        error: (err) => {
          if (err.status === 401) {
            this.errorMessage.set('Sessão expirada. Faça login novamente.');
            return;
          }

          this.errorMessage.set('Erro ao carregar os veículos recentes.');
        },
      });
  }

  protected statusLabel(status: RecentVehicle['status']): string {
    return VEHICLE_STATUS_LABEL[status];
  }
}
