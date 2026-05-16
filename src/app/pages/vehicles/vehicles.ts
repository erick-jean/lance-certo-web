import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Vehicle, vehicles } from './vehicles-data';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles {
  protected readonly vehicles = vehicles;
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly vehicleSearch = signal('');
  protected readonly statusFilter = signal<'ALL' | Vehicle['status']>('ALL');
  protected readonly typeFilter = signal<'ALL' | Vehicle['type']>('ALL');
  protected readonly locationFilter = signal('ALL');

  protected readonly locations = Array.from(
    new Set(vehicles.map((vehicle) => [vehicle.city, vehicle.state].filter(Boolean).join(' / ')).filter(Boolean)),
  );

  protected readonly filteredVehicles = computed(() => {
    const search = this.vehicleSearch().trim().toLowerCase();
    const status = this.statusFilter();
    const type = this.typeFilter();
    const location = this.locationFilter();

    return this.vehicles.filter((vehicle) => {
      const searchableText = [
        vehicle.brand,
        vehicle.model,
        vehicle.version,
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

  protected setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected vehicleTitle(vehicle: Vehicle): string {
    return [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(' ');
  }

  protected vehicleSubtitle(vehicle: Vehicle): string {
    const year = [vehicle.yearManufacture, vehicle.yearModel].filter(Boolean).join('/');
    const location = [vehicle.city, vehicle.state].filter(Boolean).join(', ');
    return [year, location].filter(Boolean).join(' • ');
  }

  protected coverImage(vehicle: Vehicle): string {
    return vehicle.images[0]?.url ?? '';
  }

  protected statusLabel(status: Vehicle['status']): string {
    const labels = {
      ANALYZING: 'Em análise',
      PURCHASED: 'Arrematado',
      SOLD: 'Vendido',
    };

    return labels[status];
  }

  protected damageLabel(damageType: Vehicle['damageType']): string {
    const labels = {
      NONE: 'Sem avaria',
      LIGHT: 'Avaria leve',
      MEDIUM: 'Avaria média',
      HEAVY: 'Avaria grave',
    };

    return labels[damageType];
  }

  protected vehicleTypeLabel(type: Vehicle['type']): string {
    return {
      CAR: 'Carro',
      MOTORCYCLE: 'Moto',
      TRUCK: 'Caminhão',
    }[type];
  }
  protected fuelTypeLabel(fuelType: Vehicle['fuelType']): string {
    if (!fuelType) return '-';

    return {
      FLEX: 'Flex',
      GASOLINE: 'Gasolina',
      DIESEL: 'Diesel',
      ELECTRIC: 'Elétrico',
      HYBRID: 'Híbrido',
    }[fuelType];
  }

  protected transmissionLabel(transmission: Vehicle['transmission']): string {
    if (!transmission) return '-';

    return {
      MANUAL: 'Manual',
      AUTOMATIC: 'Automático',
    }[transmission];
  }

  protected formatMileage(mileage: Vehicle['mileage']): string {
    if (mileage === undefined || mileage === null) return '-';

    return `${new Intl.NumberFormat('pt-BR').format(mileage)} km`;
  }

  protected formatDate(date: Vehicle['eventDate']): string {
    if (!date) return '-';

    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(date));
  }
}
