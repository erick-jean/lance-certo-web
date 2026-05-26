import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StatusBadge, StatusBadgeTone } from '../../shared/components/status-badge/status-badge';
import { Vehicle, Vehicles as VehiclesService } from '../../core/services/vehicles';
import {
  FUEL_TYPE_LABEL,
  TRANSMISSION_LABEL,
  VEHICLE_DAMAGE_LABEL,
  VEHICLE_STATUS_LABEL,
  VEHICLE_TYPE_LABEL,
  formatCurrency,
  formatDate,
  formatMileage,
  safeImageUrl,
  vehicleSubtitle,
  vehicleTitle,
} from './vehicle-labels';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink, StatusBadge],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles implements OnInit {
  private readonly vehiclesService = inject(VehiclesService);

  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly vehicleSearch = signal('');
  protected readonly statusFilter = signal<'ALL' | Vehicle['status']>('ALL');
  protected readonly typeFilter = signal<'ALL' | Vehicle['type']>('ALL');
  protected readonly locationFilter = signal('ALL');

  protected readonly locations = computed(() =>
    Array.from(
      new Set(
        this.vehicles()
          .map((vehicle) => [vehicle.city, vehicle.state].filter(Boolean).join(' / '))
          .filter(Boolean),
      ),
    ),
  );

  protected readonly filteredVehicles = computed(() => {
    const search = this.vehicleSearch().trim().toLowerCase();
    const status = this.statusFilter();
    const type = this.typeFilter();
    const location = this.locationFilter();

    return this.vehicles().filter((vehicle) => {
      const searchableText = [
        vehicle.brand,
        vehicle.model,
        vehicle.plate,
        vehicle.city,
        vehicle.state,
        vehicle.auctioneer,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const vehicleLocation = [vehicle.city, vehicle.state].filter(Boolean).join(' / ');

      return (
        (!search || searchableText.includes(search)) &&
        (status === 'ALL' || vehicle.status === status) &&
        (type === 'ALL' || vehicle.type === type) &&
        (location === 'ALL' || vehicleLocation === location)
      );
    });
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  protected loadVehicles(): void {
    this.loading.set(true);
    this.error.set('');

    this.vehiclesService.getVehicles({ limit: 100 }).subscribe({
      next: (response) => {
        this.vehicles.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar veiculos', error);
        this.vehicles.set([]);
        this.loading.set(false);
        this.error.set('Nao foi possivel carregar seus veiculos agora.');
      },
    });
  }

  protected setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected vehicleTitle(vehicle: Vehicle): string {
    return vehicleTitle(vehicle) || 'Veiculo sem nome';
  }

  protected vehicleSubtitle(vehicle: Vehicle): string {
    return vehicleSubtitle(vehicle);
  }

  protected coverImage(vehicle: Vehicle): string {
    return safeImageUrl(vehicle.images?.[0]?.url);
  }

  protected statusLabel(status: Vehicle['status']): string {
    return VEHICLE_STATUS_LABEL[status];
  }

  protected damageLabel(damageType: Vehicle['damageType']): string {
    return VEHICLE_DAMAGE_LABEL[damageType];
  }

  protected statusTone(status: Vehicle['status']): StatusBadgeTone {
    return status === 'ANALYZING' ? 'warning' : 'success';
  }

  protected damageTone(damageType: Vehicle['damageType']): StatusBadgeTone {
    if (damageType === 'MEDIUM_DAMAGE' || damageType === 'HIGH_DAMAGE' || damageType === 'FLOOD') {
      return 'risk-medium';
    }

    return 'risk-low';
  }

  protected vehicleTypeLabel(type: Vehicle['type']): string {
    return VEHICLE_TYPE_LABEL[type];
  }

  protected fuelTypeLabel(fuelType: Vehicle['fuelType']): string {
    if (!fuelType) return '-';

    return FUEL_TYPE_LABEL[fuelType];
  }

  protected transmissionLabel(transmission: Vehicle['transmission']): string {
    if (!transmission) return '-';

    return TRANSMISSION_LABEL[transmission];
  }

  protected formatMileage(mileage: Vehicle['mileage']): string {
    return formatMileage(mileage);
  }

  protected formatDate(date: Vehicle['eventDate']): string {
    return formatDate(date);
  }

  protected formatCurrency(value: number | string | null | undefined): string {
    return formatCurrency(value);
  }
}
