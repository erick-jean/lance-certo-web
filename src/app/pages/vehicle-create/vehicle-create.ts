import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { VEHICLE_TYPE_OPTIONS } from '../../core/constants/vehicle-type-options';
import { VehicleType } from '../../core/types/vehicle-type.type';
import {
  BrandsListResponse,
  FipeService,
  ModelsListResponse,
  YearsListResponse,
} from '../../core/services/fipe';

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

  form = new FormGroup({
    vehicleType: new FormControl<VehicleType | ''>('', {
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
      validators: [Validators.required],
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
    yearManufacture: new FormControl<number | null>({ value: null, disabled: false }),
  });

  public getBrands(vehicleType: VehicleType | ''): void {
    this.form.controls.brand.reset('');
    this.form.controls.brand.disable();
    this.resetModels();

    this.brands.set([]);
    this.brandsError.set('');
    this.brandSearch.set('');

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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.getRawValue());
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
}
