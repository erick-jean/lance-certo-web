import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Vehicle, vehicles } from './vehicles-data';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles {
  protected readonly vehicles = vehicles;

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
}
