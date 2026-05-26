import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { safeImageUrl } from '../vehicles/vehicle-labels';
import {
  BrandsListResponse,
  FipeVehicleInfoResponse,
  FipeService,
  ModelsListResponse,
  VehicleType,
  YearsListResponse,
} from '../../core/services/fipe';

type SelectOption = {
  label: string;
  value: string;
};

type StaticDropdownId = 'fuel' | 'transmission' | 'auctionType' | 'status' | 'damage';

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
  protected readonly vehicleTypeDropdownOpen = signal(false);
  protected readonly brands = signal<BrandsListResponse[]>([]);
  protected readonly selectedBrand = signal<BrandsListResponse | null>(null);
  protected readonly brandSearch = signal('');
  protected readonly brandsLoading = signal(false);
  protected readonly brandsError = signal('');
  protected readonly brandDropdownOpen = signal(false);
  protected readonly models = signal<ModelsListResponse[]>([]);
  protected readonly selectedModel = signal<ModelsListResponse | null>(null);
  protected readonly modelSearch = signal('');
  protected readonly modelsLoading = signal(false);
  protected readonly modelsError = signal('');
  protected readonly modelDropdownOpen = signal(false);
  protected readonly years = signal<YearsListResponse[]>([]);
  protected readonly selectedYear = signal<YearsListResponse | null>(null);
  protected readonly yearSearch = signal('');
  protected readonly yearsLoading = signal(false);
  protected readonly yearsError = signal('');
  protected readonly yearDropdownOpen = signal(false);
  protected readonly fipeVehicleInfo = signal<FipeVehicleInfoResponse | null>(null);
  protected readonly fipeVehicleInfoLoading = signal(false);
  protected readonly fipeVehicleInfoError = signal('');
  protected readonly staticDropdownOpen = signal<StaticDropdownId | null>(null);
  protected readonly staticDropdownValues = signal<Record<StaticDropdownId, string>>({
    fuel: '',
    transmission: '',
    auctionType: '',
    status: 'in-review',
    damage: 'none',
  });
  protected readonly vehicleTypeOptions: Array<{ label: string; value: VehicleType | '' }> = [
    { label: 'Selecionar', value: '' },
    { label: 'Carro', value: 'cars' },
    { label: 'Moto', value: 'motorcycles' },
    { label: 'Caminhão', value: 'trucks' },
  ];

  protected readonly staticDropdownOptions: Record<StaticDropdownId, SelectOption[]> = {
    fuel: [
      { label: 'Selecionar', value: '' },
      { label: 'Flex', value: 'flex' },
      { label: 'Gasolina', value: 'gasoline' },
      { label: 'Diesel', value: 'diesel' },
      { label: 'Elétrico', value: 'electric' },
      { label: 'Híbrido', value: 'hybrid' },
    ],
    transmission: [
      { label: 'Selecionar', value: '' },
      { label: 'Manual', value: 'manual' },
      { label: 'Automático', value: 'automatic' },
    ],
    auctionType: [
      { label: 'Selecionar', value: '' },
      { label: 'Online', value: 'online' },
      { label: 'Presencial', value: 'in-person' },
      { label: 'Híbrido', value: 'hybrid' },
    ],
    status: [
      { label: 'Em análise', value: 'in-review' },
      { label: 'Arrematado', value: 'won' },
      { label: 'Vendido', value: 'sold' },
    ],
    damage: [
      { label: 'Sem avaria', value: 'none' },
      { label: 'Avaria leve', value: 'light' },
      { label: 'Avaria média', value: 'medium' },
      { label: 'Avaria grave', value: 'severe' },
    ],
  };

  protected readonly vehicleTypeLabel = computed(() => {
    return (
      this.vehicleTypeOptions.find((option) => option.value === this.vehicleType())?.label ??
      'Selecionar'
    );
  });

  protected readonly filteredBrands = computed(() => {
    const search = this.normalizeText(this.brandSearch());

    if (!search) {
      return this.brands();
    }

    return this.brands().filter((brand) => this.normalizeText(brand.name).includes(search));
  });

  protected readonly filteredModels = computed(() => {
    const search = this.normalizeText(this.modelSearch());

    if (!search) {
      return this.models();
    }

    return this.models().filter((model) => this.normalizeText(model.name).includes(search));
  });

  protected readonly filteredYears = computed(() => {
    const search = this.normalizeText(this.yearSearch());

    if (!search) {
      return this.years();
    }

    return this.years().filter((year) => this.normalizeText(year.name).includes(search));
  });

  protected readonly fipeCode = computed(() => {
    return this.getFipeInfoText(['codeFipe', 'fipeCode', 'codigoFipe', 'codigo_fipe']);
  });

  protected readonly fipeValue = computed(() => {
    return this.getFipeInfoText(['price', 'value', 'valor', 'valorFipe', 'fipeValue']);
  });

  protected selectVehicleType(vehicleType: VehicleType | ''): void {
    this.vehicleType.set(vehicleType);
    this.vehicleTypeDropdownOpen.set(false);
    this.resetBrandSelection();
    this.resetModelSelection();
    this.resetYearSelection();

    if (!vehicleType) {
      return;
    }

    this.getBrands(vehicleType);
  }

  protected openVehicleTypeDropdown(): void {
    this.vehicleTypeDropdownOpen.set(true);
  }

  protected closeVehicleTypeDropdown(): void {
    window.setTimeout(() => {
      this.vehicleTypeDropdownOpen.set(false);
    }, 120);
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

  protected openModelDropdown(): void {
    if (!this.selectedBrand()) {
      return;
    }

    this.modelDropdownOpen.set(true);
  }

  protected openYearDropdown(): void {
    if (!this.selectedModel()) {
      return;
    }

    this.yearDropdownOpen.set(true);
  }

  protected closeYearDropdown(): void {
    window.setTimeout(() => {
      this.yearDropdownOpen.set(false);
    }, 120);
  }

  protected closeModelDropdown(): void {
    window.setTimeout(() => {
      this.modelDropdownOpen.set(false);
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
    this.resetModelSelection();
    this.resetYearSelection();

    const vehicleType = this.vehicleType();

    if (vehicleType) {
      this.getModels(vehicleType, brand.code);
    }
  }

  protected onModelSearch(value: string): void {
    this.modelSearch.set(value);
    this.selectedModel.set(null);
    this.openModelDropdown();
  }

  protected selectModel(model: ModelsListResponse): void {
    this.selectedModel.set(model);
    this.modelSearch.set(model.name);
    this.modelDropdownOpen.set(false);
    this.resetYearSelection();

    const vehicleType = this.vehicleType();
    const brand = this.selectedBrand();

    if (vehicleType && brand) {
      this.getYears(vehicleType, brand.code, model.code);
    }
  }

  protected onYearSearch(value: string): void {
    this.yearSearch.set(value);
    this.selectedYear.set(null);
    this.resetFipeVehicleInfo();
    this.openYearDropdown();
  }

  protected selectYear(year: YearsListResponse): void {
    this.selectedYear.set(year);
    this.yearSearch.set(year.name);
    this.yearDropdownOpen.set(false);

    const vehicleType = this.vehicleType();
    const brand = this.selectedBrand();
    const model = this.selectedModel();

    if (vehicleType && brand && model) {
      this.getVehicleInfo(vehicleType, brand.code, model.code, year.code);
    }
  }

  protected openStaticDropdown(dropdownId: StaticDropdownId): void {
    this.staticDropdownOpen.set(dropdownId);
  }

  protected closeStaticDropdown(dropdownId: StaticDropdownId): void {
    window.setTimeout(() => {
      if (this.staticDropdownOpen() === dropdownId) {
        this.staticDropdownOpen.set(null);
      }
    }, 120);
  }

  protected selectStaticDropdownOption(dropdownId: StaticDropdownId, value: string): void {
    this.staticDropdownValues.update((values) => ({
      ...values,
      [dropdownId]: value,
    }));
    this.staticDropdownOpen.set(null);
  }

  protected staticDropdownLabel(dropdownId: StaticDropdownId): string {
    const selectedValue = this.staticDropdownValues()[dropdownId];

    return (
      this.staticDropdownOptions[dropdownId].find((option) => option.value === selectedValue)
        ?.label ?? 'Selecionar'
    );
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

  private getModels(vehicleType: VehicleType, brandId: string): void {
    this.modelsLoading.set(true);
    this.modelsError.set('');

    this.fipeService.getModels(vehicleType, brandId).subscribe({
      next: (models) => {
        console.log(models);
        this.models.set(models);
        this.modelsLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar modelos FIPE', error);
        this.models.set([]);
        this.modelsLoading.set(false);
        this.modelsError.set('Não foi possível carregar os modelos.');
      },
    });
  }

  private getYears(vehicleType: VehicleType, brandId: string, modelId: string): void {
    this.yearsLoading.set(true);
    this.yearsError.set('');

    this.fipeService.getYears(vehicleType, brandId, modelId).subscribe({
      next: (years) => {
        console.log(years);
        this.years.set(years);
        this.yearsLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar anos FIPE', error);
        this.years.set([]);
        this.yearsLoading.set(false);
        this.yearsError.set('Não foi possível carregar os anos.');
      },
    });
  }

  private getVehicleInfo(
    vehicleType: VehicleType,
    brandId: string,
    modelId: string,
    yearId: string,
  ): void {
    this.fipeVehicleInfoLoading.set(true);
    this.fipeVehicleInfoError.set('');
    this.fipeVehicleInfo.set(null);

    this.fipeService.getVehicleInfo(vehicleType, brandId, modelId, yearId).subscribe({
      next: (vehicleInfo) => {
        console.log(vehicleInfo);
        this.fipeVehicleInfo.set(vehicleInfo);
        this.fipeVehicleInfoLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar informaÃ§Ãµes FIPE do veÃ­culo', error);
        this.fipeVehicleInfo.set(null);
        this.fipeVehicleInfoLoading.set(false);
        this.fipeVehicleInfoError.set('NÃ£o foi possÃ­vel carregar os dados FIPE do veÃ­culo.');
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

  private resetModelSelection(): void {
    this.models.set([]);
    this.selectedModel.set(null);
    this.modelSearch.set('');
    this.modelsError.set('');
    this.modelDropdownOpen.set(false);
  }

  private resetYearSelection(): void {
    this.years.set([]);
    this.selectedYear.set(null);
    this.yearSearch.set('');
    this.yearsError.set('');
    this.yearDropdownOpen.set(false);
    this.resetFipeVehicleInfo();
  }

  private resetFipeVehicleInfo(): void {
    this.fipeVehicleInfo.set(null);
    this.fipeVehicleInfoLoading.set(false);
    this.fipeVehicleInfoError.set('');
  }

  private getFipeInfoText(keys: string[]): string {
    const vehicleInfo = this.fipeVehicleInfo();

    if (!vehicleInfo) {
      return '';
    }

    for (const key of keys) {
      const value = vehicleInfo[key];

      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }

    return '';
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
