import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { DashboardCache } from '../../core/services/dashboard-cache';
import { VehiclesCache } from '../../core/services/vehicles-cache';
import { VehicleStatus } from '../vehicles/vehicles-data';
import { VEHICLE_STATUS_LABEL } from '../vehicles/vehicle-labels';
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
export class Home implements OnInit {
  private readonly dashboardCache = inject(DashboardCache);
  private readonly vehiclesCache = inject(VehiclesCache);

  // Delegate state to caches
  protected readonly summaryLoading = this.dashboardCache.loading;
  protected readonly recentVehiclesLoading = this.vehiclesCache.loading;
  protected readonly errorMessage = this.dashboardCache.error;

  // Keep the skeleton aligned with the recent-vehicles list size
  protected readonly loadingRows = [0, 1, 2, 3, 4];

  protected readonly summaryCards = computed<SummaryCard[]>(() => {
    const data = this.dashboardCache.summary();
    if (!data) return [];

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

  /**
   * Derived from VehiclesCache — no extra HTTP request needed.
   * Sorted by most recent activity, limited to 5 items.
   */
  protected readonly recentVehicles = computed<RecentVehicle[]>(() => {
    const allowedStatus: VehicleStatus[] = ['ANALYZING', 'PURCHASED'];

    return this.vehiclesCache
      .vehicles()
      .filter((v) => allowedStatus.includes(v.status))
      .slice(0, 5)
      .map((vehicle) => ({
        id: vehicle.id,
        name: [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Veiculo sem nome',
        year: [vehicle.yearManufacture, vehicle.yearModel].filter(Boolean).join('/') || '-',
        plate: formatPlate(vehicle.plate ?? ''),
        status: vehicle.status as RecentVehicle['status'],
        date:
          vehicle.status === 'ANALYZING'
            ? formatDate(vehicle.createdAt ?? new Date())
            : formatDate(vehicle.purchasedAt || vehicle.createdAt || new Date()),
        link: `/veiculos/${vehicle.id}`,
      }));
  });

  ngOnInit(): void {
    this.dashboardCache.fetch();
    this.vehiclesCache.fetch();
  }

  protected loadSummary(): void {
    this.dashboardCache.fetch(true);
  }

  protected statusLabel(status: RecentVehicle['status']): string {
    return VEHICLE_STATUS_LABEL[status];
  }
}
