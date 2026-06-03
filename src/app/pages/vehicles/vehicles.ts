import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StatusBadge, StatusBadgeTone } from '../../shared/components/status-badge/status-badge';
import { Vehicle } from '../../core/services/vehicles';
import { VehiclesCache } from '../../core/services/vehicles-cache';
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
  imports: [
    FormsModule,
    RouterLink,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    StatusBadge,
  ],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles implements OnInit {
  private readonly vehiclesCache = inject(VehiclesCache);

  // Delegate loading/error state to the cache service
  protected readonly loading = this.vehiclesCache.loading;
  protected readonly error = this.vehiclesCache.error;

  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly vehicleSearch = signal('');
  protected readonly statusFilter = signal<'ALL' | Vehicle['status']>('ALL');
  protected readonly typeFilter = signal<'ALL' | Vehicle['type']>('ALL');

  protected readonly filteredVehicles = computed(() => {
    const search = this.vehicleSearch().trim().toLowerCase();
    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.vehiclesCache.vehicles().filter((vehicle) => {
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

      return (
        (!search || searchableText.includes(search)) &&
        (status === 'ALL' || vehicle.status === status) &&
        (type === 'ALL' || vehicle.type === type)
      );
    });
  });

  ngOnInit(): void {
    this.vehiclesCache.fetch();
  }

  /** Called by the "Tentar novamente" button — forces a fresh fetch. */
  protected loadVehicles(): void {
    this.vehiclesCache.fetch(true);
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
