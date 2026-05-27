import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

import {
  BrandsListResponse,
  FipeService,
  FipeVehicleInfoResponse,
  ModelsListResponse,
  YearsListResponse,
} from '../../core/services/fipe';
import { VehicleFipeType } from '../../core/types/vehicle-options.type';
import { normalizeText } from '../../core/utils/normalize-text';

@Injectable()
export class VehicleCreateFacade {
  private readonly fipeService = inject(FipeService);

  readonly brands = signal<BrandsListResponse[]>([]);
  readonly brandsLoading = signal(false);
  readonly brandsError = signal('');
  readonly brandSearch = signal('');

  readonly models = signal<ModelsListResponse[]>([]);
  readonly modelsLoading = signal(false);
  readonly modelsError = signal('');
  readonly modelSearch = signal('');

  readonly years = signal<YearsListResponse[]>([]);
  readonly yearsLoading = signal(false);
  readonly yearsError = signal('');
  readonly yearSearch = signal('');

  readonly fipeInfoLoading = signal(false);
  readonly fipeInfoError = signal('');

  readonly filteredBrands = computed(() => {
    const search = normalizeText(this.brandSearch());
    return search
      ? this.brands().filter((brand) => normalizeText(brand.name).includes(search))
      : this.brands();
  });

  readonly filteredModels = computed(() => {
    const search = normalizeText(this.modelSearch());
    return search
      ? this.models().filter((model) => normalizeText(model.name).includes(search))
      : this.models();
  });

  readonly filteredYears = computed(() => {
    const search = normalizeText(this.yearSearch());
    return search
      ? this.years().filter((year) => normalizeText(this.getYearLabel(year)).includes(search))
      : this.years();
  });

  getBrands(vehicleType: VehicleFipeType | ''): void {
    // Trocar o tipo do veiculo invalida toda a cadeia FIPE: marca, modelo, ano e valores.
    this.resetModels();
    this.resetYears();
    this.resetFipeInfo();
    this.brands.set([]);
    this.brandsError.set('');
    this.brandSearch.set('');

    if (!vehicleType) return;

    this.brandsLoading.set(true);

    this.fipeService
      .getBrands(vehicleType)
      .pipe(finalize(() => this.brandsLoading.set(false)))
      .subscribe({
        next: (brands) => this.brands.set(brands),
        error: () => {
          this.brands.set([]);
          this.brandsError.set('Não foi possível carregar as marcas.');
        },
      });
  }

  getModels(vehicleType: VehicleFipeType | '', brandCode: string): void {
    // Trocar a marca invalida modelos, anos e dados calculados da FIPE.
    this.resetModels();
    this.resetYears();
    this.resetFipeInfo();

    if (!vehicleType || !brandCode) return;

    this.modelsLoading.set(true);

    this.fipeService
      .getModels(vehicleType, brandCode)
      .pipe(finalize(() => this.modelsLoading.set(false)))
      .subscribe({
        next: (models) => this.models.set(models),
        error: () => {
          this.models.set([]);
          this.modelsError.set('Não foi possível carregar os modelos.');
        },
      });
  }

  getYears(vehicleType: VehicleFipeType | '', brandCode: string, modelCode: string): void {
    // Trocar o modelo invalida o ano e os dados de codigo/valor FIPE.
    this.resetYears();
    this.resetFipeInfo();

    if (!vehicleType || !brandCode || !modelCode) return;

    this.yearsLoading.set(true);

    this.fipeService
      .getYears(vehicleType, brandCode, modelCode)
      .pipe(finalize(() => this.yearsLoading.set(false)))
      .subscribe({
        next: (years) => this.years.set(years),
        error: () => {
          this.years.set([]);
          this.yearsError.set('Não foi possível carregar os anos.');
        },
      });
  }

  getFipeVehicleInfo(
    vehicleType: VehicleFipeType | '',
    brandCode: string,
    modelCode: string,
    yearCode: string,
    onSuccess: (vehicleInfo: FipeVehicleInfoResponse) => void,
  ): void {
    this.resetFipeInfo();

    if (!vehicleType || !brandCode || !modelCode || !yearCode) return;

    this.fipeInfoLoading.set(true);

    this.fipeService
      .getVehicleInfo(vehicleType, brandCode, modelCode, yearCode)
      .pipe(finalize(() => this.fipeInfoLoading.set(false)))
      .subscribe({
        next: (vehicleInfo) => onSuccess(vehicleInfo),
        error: () => {
          this.fipeInfoError.set('Não foi possível carregar os dados FIPE.');
        },
      });
  }

  resetModels(): void {
    this.models.set([]);
    this.modelsError.set('');
    this.modelSearch.set('');
    this.modelsLoading.set(false);
  }

  resetYears(): void {
    this.years.set([]);
    this.yearsError.set('');
    this.yearSearch.set('');
    this.yearsLoading.set(false);
  }

  resetFipeInfo(): void {
    this.fipeInfoError.set('');
    this.fipeInfoLoading.set(false);
  }

  getYearLabel(year: YearsListResponse): string {
    if (/[a-zA-ZÀ-ÿ]/.test(year.name)) {
      return year.name;
    }

    const fuelTypeCode = year.code.split('-').at(-1);
    const fuelTypeByCode: Record<string, string> = {
      '1': 'Gasolina',
      '2': 'Álcool',
      '3': 'Diesel',
    };
    const fuelType = fuelTypeCode ? fuelTypeByCode[fuelTypeCode] : undefined;

    return fuelType ? `${year.name} ${fuelType}` : year.name;
  }
}
