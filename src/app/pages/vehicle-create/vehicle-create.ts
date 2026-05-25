import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { safeImageUrl } from '../vehicles/vehicle-labels';
import { BrandsListResponse, FipeService, VehicleType } from '../../core/services/fipe';

@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  templateUrl: './vehicle-create.html',
  styleUrl: './vehicle-create.scss',
})
export class VehicleCreate {
  private readonly fipeService = inject(FipeService);

  protected readonly vehicleType = signal<VehicleType | ''>('');
  protected readonly brands = signal<BrandsListResponse[]>([]);
  protected readonly selectedBrand = signal<BrandsListResponse | null>(null);
  protected readonly brandSearch = signal('');
  protected readonly brandsLoading = signal(false);
  protected readonly brandsError = signal('');
  protected readonly brandDropdownOpen = signal(false);

  protected readonly filteredBrands = computed(() => {
    const search = this.normalizeText(this.brandSearch());

    if (!search) {
      return this.brands();
    }

    return this.brands().filter((brand) => this.normalizeText(brand.name).includes(search));
  });

  protected onVehicleTypeChange(event: Event): void {
    const vehicleType = (event.target as HTMLSelectElement).value as VehicleType | '';

    this.vehicleType.set(vehicleType);
    this.resetBrandSelection();

    if (!vehicleType) {
      return;
    }

    this.getBrands(vehicleType);
  }

  protected openBrandDropdown(): void {
    if (!this.vehicleType()) {
      return;
    }

    this.brandDropdownOpen.set(true);
  }

  protected closeBrandDropdown(): void {
    window.setTimeout(() => {
      this.brandDropdownOpen.set(false);
    }, 120);
  }

  protected onBrandSearch(value: string): void {
    this.brandSearch.set(value);
    this.selectedBrand.set(null);
    this.openBrandDropdown();
  }

  protected selectBrand(brand: BrandsListResponse): void {
    this.selectedBrand.set(brand);
    this.brandSearch.set(brand.name);
    this.brandDropdownOpen.set(false);
  }

  private getBrands(vehicleType: VehicleType): void {
    this.brandsLoading.set(true);
    this.brandsError.set('');

    this.fipeService.getBrands(vehicleType).subscribe({
      next: (brands) => {
        console.log(brands);
        this.brands.set(brands);
        this.brandsLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar marcas FIPE', error);
        this.brands.set([]);
        this.brandsLoading.set(false);
        this.brandsError.set('Não foi possível carregar as marcas.');
      },
    });
  }

  private resetBrandSelection(): void {
    this.brands.set([]);
    this.selectedBrand.set(null);
    this.brandSearch.set('');
    this.brandsError.set('');
    this.brandDropdownOpen.set(false);
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  protected readonly previewImages = [
    'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
  ].map((image) => safeImageUrl(image));
}
