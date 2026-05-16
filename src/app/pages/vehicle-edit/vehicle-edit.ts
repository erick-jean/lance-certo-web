import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  AuctionType,
  FuelType,
  TransmissionType,
  VehicleDamageType,
  VehicleStatus,
  vehicles,
} from '../vehicles/vehicles-data';

@Component({
  selector: 'app-vehicle-edit',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  templateUrl: './vehicle-edit.html',
  styleUrl: '../vehicle-create/vehicle-create.scss',
})
export class VehicleEdit {
  private readonly route = inject(ActivatedRoute);

  protected readonly vehicle = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return vehicles.find((vehicle) => vehicle.id === id) ?? vehicles[0];
  });

  protected readonly previewImages = computed(() => this.vehicle().images.map((image) => image.url));

  protected vehicleTitle(): string {
    const vehicle = this.vehicle();
    return [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(' ');
  }

  protected fuelTypeLabel(fuelType?: FuelType): string {
    if (!fuelType) return '';

    return {
      FLEX: 'Flex',
      GASOLINE: 'Gasolina',
      DIESEL: 'Diesel',
      ELECTRIC: 'Elétrico',
      HYBRID: 'Híbrido',
    }[fuelType];
  }

  protected transmissionLabel(transmission?: TransmissionType): string {
    if (!transmission) return '';

    return {
      MANUAL: 'Manual',
      AUTOMATIC: 'Automático',
    }[transmission];
  }

  protected statusLabel(status: VehicleStatus): string {
    return {
      ANALYZING: 'Em análise',
      PURCHASED: 'Arrematado',
      SOLD: 'Vendido',
    }[status];
  }

  protected auctionTypeLabel(auctionType?: AuctionType): string {
    if (!auctionType) return '';

    return {
      ONLINE: 'Online',
      IN_PERSON: 'Presencial',
      HYBRID: 'Híbrido',
    }[auctionType];
  }

  protected damageLabel(damageType: VehicleDamageType): string {
    return {
      NONE: 'Sem avaria',
      LIGHT: 'Avaria leve',
      MEDIUM: 'Avaria média',
      HEAVY: 'Avaria grave',
    }[damageType];
  }

  protected dateInputValue(date?: string): string {
    if (!date) return '';

    return date.slice(0, 10);
  }
}
