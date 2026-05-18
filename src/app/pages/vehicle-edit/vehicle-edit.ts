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
import {
  AUCTION_TYPE_LABEL,
  FUEL_TYPE_LABEL,
  TRANSMISSION_LABEL,
  VEHICLE_DAMAGE_LABEL,
  VEHICLE_STATUS_LABEL,
  safeImageUrl,
  vehicleTitle,
} from '../vehicles/vehicle-labels';

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

  protected readonly previewImages = computed(() =>
    this.vehicle()
      .images.map((image) => safeImageUrl(image.url))
      .filter(Boolean),
  );

  protected vehicleTitle(): string {
    return vehicleTitle(this.vehicle());
  }

  protected fuelTypeLabel(fuelType?: FuelType): string {
    if (!fuelType) return '';

    return FUEL_TYPE_LABEL[fuelType];
  }

  protected transmissionLabel(transmission?: TransmissionType): string {
    if (!transmission) return '';

    return TRANSMISSION_LABEL[transmission];
  }

  protected statusLabel(status: VehicleStatus): string {
    return VEHICLE_STATUS_LABEL[status];
  }

  protected auctionTypeLabel(auctionType?: AuctionType): string {
    if (!auctionType) return '';

    return AUCTION_TYPE_LABEL[auctionType];
  }

  protected damageLabel(damageType: VehicleDamageType): string {
    return VEHICLE_DAMAGE_LABEL[damageType];
  }

  protected dateInputValue(date?: string): string {
    if (!date) return '';

    return date.slice(0, 10);
  }
}
