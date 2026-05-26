import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { VEHICLE_TYPE_OPTIONS } from '../../core/constants/vehicle-type-options';
import { VehicleFipeType, VehicleType } from '../../core/types/vehicle-options.type';
import {
  BrandsListResponse,
  FipeVehicleInfoResponse,
  FipeService,
  ModelsListResponse,
  YearsListResponse,
} from '../../core/services/fipe';
import { AUCTION_TYPE_OPTIONS } from '../../core/constants/auction-type-options';
import { DAMAGE_TYPE_OPTIONS } from '../../core/constants/damage-type-options';
import { FUEL_TYPE_OPTIONS } from '../../core/constants/fuel-type-options';
import { TRANSMISSION_OPTIONS } from '../../core/constants/transmission-options';

@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './vehicle-create.html',
  styleUrl: './vehicle-create.scss',
})
export class VehicleCreate {
  private readonly fipeService = inject(FipeService);
  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly fuelTypeOptions = FUEL_TYPE_OPTIONS;
  readonly transmissionOptions = TRANSMISSION_OPTIONS;
  readonly auctionTypeOptions = AUCTION_TYPE_OPTIONS;
  readonly damageTypeOptions = DAMAGE_TYPE_OPTIONS;

  form = new FormGroup({
    vehicleType: new FormControl<VehicleFipeType | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    brand: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),

    plate: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^([A-Z]{3}-\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/),
      ],
    }),

    model: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),

    yearModel: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    yearManufacture: new FormControl<number | null>(null, {
      validators: [Validators.min(1900), Validators.max(2099), Validators.pattern(/^\d{4}$/)],
    }),
    fipeCode: new FormControl<string>('', {
      nonNullable: true,
    }),
    fipeValue: new FormControl<string>('', {
      nonNullable: true,
    }),
    marketValue: new FormControl<string>('', {
      nonNullable: true,
    }),
    color: new FormControl<string>('', {
      nonNullable: true,
    }),
    mileage: new FormControl<number | null>(null, {
      validators: [Validators.min(0)],
    }),
    fuelType: new FormControl<string>('', {
      nonNullable: true,
    }),
    transmission: new FormControl<string>('', {
      nonNullable: true,
    }),
    auctioneer: new FormControl<string>('', {
      nonNullable: true,
    }),
    auctionType: new FormControl<string>('', {
      nonNullable: true,
    }),
    eventDate: new FormControl<string>('', {
      nonNullable: true,
    }),
    city: new FormControl<string>('', {
      nonNullable: true,
    }),
    state: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^[A-Z]{2}$/)],
    }),
    auctionInitialBid: new FormControl<string>('', {
      nonNullable: true,
    }),
    auctionCurrentBid: new FormControl<string>('', {
      nonNullable: true,
    }),
    yardAddress: new FormControl<string>('', {
      nonNullable: true,
    }),
    sourceUrl: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^https?:\/\/.+/)],
    }),
    damageType: new FormControl<string>('NONE', {
      nonNullable: true,
    }),
    desiredProfitMarginPercent: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(100)],
    }),
    safetyMarginPercent: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(100)],
    }),
    notes: new FormControl<string>('', {
      nonNullable: true,
    }),
  });

  onlyFourDigits(event: Event): void {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '').slice(0, 4);

    this.form.controls.yearManufacture.setValue(input.value ? Number(input.value) : null);
  }

  formatMarketValue(event: Event): void {
    this.formatCurrencyControl(event, 'marketValue');
  }

  formatAuctionInitialBid(event: Event): void {
    this.formatCurrencyControl(event, 'auctionInitialBid');
  }

  formatAuctionCurrentBid(event: Event): void {
    this.formatCurrencyControl(event, 'auctionCurrentBid');
  }

  formatState(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = input.value
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 2);

    input.value = formattedValue;
    this.form.controls.state.setValue(formattedValue);
  }

  private formatCurrencyControl(
    event: Event,
    controlName: 'marketValue' | 'auctionInitialBid' | 'auctionCurrentBid',
  ): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');

    if (!digits) {
      input.value = '';
      this.form.controls[controlName].setValue('');
      return;
    }

    const formattedValue = this.formatCurrency(Number(digits));
    input.value = formattedValue;
    this.form.controls[controlName].setValue(formattedValue);
  }

  formatPlate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalizedValue = input.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 7);
    const formattedValue = /^[A-Z]{3}\d{4}$/.test(normalizedValue)
      ? `${normalizedValue.slice(0, 3)}-${normalizedValue.slice(3)}`
      : normalizedValue;

    input.value = formattedValue;
    this.form.controls.plate.setValue(formattedValue);
  }

  formatMileage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');

    input.value = digits;
    this.form.controls.mileage.setValue(digits ? Number(digits) : null);
  }

  formatPercent(
    event: Event,
    controlName: 'desiredProfitMarginPercent' | 'safetyMarginPercent',
  ): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 3);
    const value = digits ? Math.min(Number(digits), 100) : null;

    input.value = value === null ? '' : String(value);
    this.form.controls[controlName].setValue(value);
  }

  public getBrands(vehicleType: VehicleFipeType | ''): void {
    this.form.controls.brand.reset('');
    this.form.controls.brand.disable();
    this.resetModels();

    this.brands.set([]);
    this.brandsError.set('');
    this.brandSearch.set('');
    this.resetFipeInfo();

    if (!vehicleType) {
      return;
    }

    this.brandsLoading.set(true);
    this.form.controls.brand.enable();

    this.fipeService.getBrands(vehicleType).subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.form.controls.brand.enable();
        this.brandsLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar marcas FIPE', error);
        this.brands.set([]);
        this.brandsError.set('Não foi possível carregar as marcas.');
        this.form.controls.brand.disable();
        this.brandsLoading.set(false);
      },
    });
  }

  public getModels(brandCode: string): void {
    this.resetModels();
    this.resetYears();
    this.resetFipeInfo();

    const vehicleType = this.form.controls.vehicleType.value;

    if (!vehicleType || !brandCode) {
      return;
    }

    this.modelsLoading.set(true);
    this.form.controls.model.enable();

    this.fipeService.getModels(vehicleType, brandCode).subscribe({
      next: (models) => {
        this.models.set(models);
        this.modelsLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar versões FIPE', error);
        this.models.set([]);
        this.modelsError.set('Não foi possível carregar as versões.');
        this.form.controls.model.disable();
        this.modelsLoading.set(false);
      },
    });
  }

  public getYears(modelCode: string): void {
    this.resetYears();
    this.resetFipeInfo();

    const vehicleType = this.form.controls.vehicleType.value;
    const brandCode = this.form.controls.brand.value;

    if (!vehicleType || !brandCode || !modelCode) {
      return;
    }

    this.yearsLoading.set(true);
    this.form.controls.yearModel.enable();

    this.fipeService.getYears(vehicleType, brandCode, modelCode).subscribe({
      next: (years) => {
        this.years.set(years);
        this.yearsLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar anos FIPE', error);
        this.years.set([]);
        this.yearsError.set('Não foi possível carregar os anos.');
        this.form.controls.yearModel.disable();
        this.yearsLoading.set(false);
      },
    });
  }

  public getFipeVehicleInfo(yearCode: string): void {
    this.resetFipeInfo();

    const vehicleType = this.form.controls.vehicleType.value;
    const brandCode = this.form.controls.brand.value;
    const modelCode = this.form.controls.model.value;

    if (!vehicleType || !brandCode || !modelCode || !yearCode) {
      return;
    }

    this.fipeInfoLoading.set(true);

    this.fipeService.getVehicleInfo(vehicleType, brandCode, modelCode, yearCode).subscribe({
      next: (vehicleInfo) => {
        this.form.controls.fipeCode.setValue(
          this.getFipeInfoText(vehicleInfo, ['codeFipe', 'fipeCode', 'codigoFipe', 'codigo_fipe']),
        );
        this.form.controls.fipeValue.setValue(
          this.getFipeInfoText(vehicleInfo, ['price', 'value', 'valor', 'valorFipe', 'fipeValue']),
        );
        this.fipeInfoLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar dados FIPE do veículo', error);
        this.fipeInfoError.set('Não foi possível carregar os dados FIPE.');
        this.fipeInfoLoading.set(false);
      },
    });
  }

  brands = signal<BrandsListResponse[]>([]);
  brandsLoading = signal(false);
  brandsError = signal('');
  brandSearch = signal('');
  models = signal<ModelsListResponse[]>([]);
  modelsLoading = signal(false);
  modelsError = signal('');
  modelSearch = signal('');
  years = signal<YearsListResponse[]>([]);
  yearsLoading = signal(false);
  yearsError = signal('');
  yearSearch = signal('');
  fipeInfoLoading = signal(false);
  fipeInfoError = signal('');

  filteredBrands = computed(() => {
    const search = this.normalizeText(this.brandSearch());

    if (!search) {
      return this.brands();
    }

    return this.brands().filter((brand) => this.normalizeText(brand.name).includes(search));
  });

  onBrandSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.brandSearch.set('');
    }
  }

  onBrandChange(brandCode: string): void {
    console.log('Marca selecionada:', brandCode);
    this.getModels(brandCode);
  }

  filteredModels = computed(() => {
    const search = this.normalizeText(this.modelSearch());

    if (!search) {
      return this.models();
    }

    return this.models().filter((model) => this.normalizeText(model.name).includes(search));
  });

  onModelSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.modelSearch.set('');
    }
  }

  onModelChange(modelCode: string): void {
    this.getYears(modelCode);
  }

  filteredYears = computed(() => {
    const search = this.normalizeText(this.yearSearch());

    if (!search) {
      return this.years();
    }

    return this.years().filter((year) =>
      this.normalizeText(this.getYearLabel(year)).includes(search),
    );
  });

  onYearSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.yearSearch.set('');
    }
  }

  onYearChange(yearCode: string): void {
    this.getFipeVehicleInfo(yearCode);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    console.log({
      ...formValue,
      type: this.getBackendVehicleType(formValue.vehicleType),
    });
  }

  private getBackendVehicleType(vehicleFipeType: VehicleFipeType | ''): VehicleType | undefined {
    const typeByFipeType: Partial<Record<VehicleFipeType, VehicleType>> = {
      cars: 'CAR',
      motorcycles: 'MOTORCYCLE',
    };

    return vehicleFipeType ? typeByFipeType[vehicleFipeType] : undefined;
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private resetModels(): void {
    this.form.controls.model.reset('');
    this.form.controls.model.disable();
    this.models.set([]);
    this.modelsError.set('');
    this.modelSearch.set('');
    this.modelsLoading.set(false);
    this.resetYears();
  }

  private resetYears(): void {
    this.form.controls.yearModel.reset('');
    this.form.controls.yearModel.disable();
    this.years.set([]);
    this.yearsError.set('');
    this.yearSearch.set('');
    this.yearsLoading.set(false);
  }

  private resetFipeInfo(): void {
    this.form.controls.fipeCode.reset('');
    this.form.controls.fipeValue.reset('');
    this.fipeInfoError.set('');
    this.fipeInfoLoading.set(false);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  }

  protected getYearLabel(year: YearsListResponse): string {
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

  private getFipeInfoText(vehicleInfo: FipeVehicleInfoResponse, keys: string[]): string {
    for (const key of keys) {
      const value = vehicleInfo[key];

      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }

    return '';
  }
}
