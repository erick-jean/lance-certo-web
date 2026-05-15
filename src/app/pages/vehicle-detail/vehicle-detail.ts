import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { vehicles } from '../vehicles/vehicles-data';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
})
export class VehicleDetail {
  private readonly route = inject(ActivatedRoute);
  protected readonly activeImageIndex = signal(0);

  protected readonly vehicle = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return vehicles.find((vehicle) => vehicle.id === id) ?? vehicles[0];
  });

  protected readonly activeImage = computed(() => this.vehicle().gallery[this.activeImageIndex()] ?? this.vehicle().imageUrl);

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected showPreviousImage(): void {
    const imagesCount = this.vehicle().gallery.length;
    this.activeImageIndex.update((index) => (index - 1 + imagesCount) % imagesCount);
  }

  protected showNextImage(): void {
    const imagesCount = this.vehicle().gallery.length;
    this.activeImageIndex.update((index) => (index + 1) % imagesCount);
  }
}
