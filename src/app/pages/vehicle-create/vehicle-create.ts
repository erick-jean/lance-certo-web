import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { VEHICLE_TYPE_OPTIONS } from '../../core/constants/vehicle-type-options';
import { VehicleFipeType, VehicleType } from '../../core/types/vehicle-options.type';
import { FipeVehicleInfoResponse, YearsListResponse } from '../../core/services/fipe';
import { AUCTION_TYPE_OPTIONS } from '../../core/constants/auction-type-options';
import { DAMAGE_TYPE_OPTIONS } from '../../core/constants/damage-type-options';
import { FUEL_TYPE_OPTIONS } from '../../core/constants/fuel-type-options';
import { TRANSMISSION_OPTIONS } from '../../core/constants/transmission-options';
import { createVehicleForm } from './vehicle-create.form';
import { VehicleCreateFacade } from './vehicle-create.facade';
import { CreateVehicleRequest, Vehicles as VehiclesService } from '../../core/services/vehicles';
import {
  formatCurrencyBRL,
  formatPlateValue,
  formatStateValue,
  onlyDigits,
} from '../../core/utils/form-formatters';

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
  providers: [VehicleCreateFacade],
})
export class VehicleCreate {
  readonly facade = inject(VehicleCreateFacade);
  private readonly router = inject(Router);
  private readonly vehiclesService = inject(VehiclesService);

  readonly form = createVehicleForm();
  submitLoading = false;
  submitError = '';

  readonly brandsLoading = this.facade.brandsLoading;
  readonly brandsError = this.facade.brandsError;
  readonly brandSearch = this.facade.brandSearch;
  readonly filteredBrands = this.facade.filteredBrands;
  readonly modelsLoading = this.facade.modelsLoading;
  readonly modelsError = this.facade.modelsError;
  readonly modelSearch = this.facade.modelSearch;
  readonly filteredModels = this.facade.filteredModels;
  readonly yearsLoading = this.facade.yearsLoading;
  readonly yearsError = this.facade.yearsError;
  readonly yearSearch = this.facade.yearSearch;
  readonly filteredYears = this.facade.filteredYears;
  readonly fipeInfoLoading = this.facade.fipeInfoLoading;
  readonly fipeInfoError = this.facade.fipeInfoError;

  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly fuelTypeOptions = FUEL_TYPE_OPTIONS;
  readonly transmissionOptions = TRANSMISSION_OPTIONS;
  readonly auctionTypeOptions = AUCTION_TYPE_OPTIONS;
  readonly damageTypeOptions = DAMAGE_TYPE_OPTIONS;

  getBrands(vehicleType: VehicleFipeType | ''): void {
    this.form.controls.brand.reset('');
    this.form.controls.brand.disable();
    this.form.controls.model.reset('');
    this.form.controls.model.disable();
    this.form.controls.yearModel.reset('');
    this.form.controls.yearModel.disable();
    this.resetFipeFields();

    this.facade.getBrands(vehicleType);

    if (vehicleType) {
      this.form.controls.brand.enable();
    }
  }

  onBrandSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.brandSearch.set('');
    }
  }

  onBrandChange(brandCode: string): void {
    this.form.controls.model.reset('');
    this.form.controls.model.disable();
    this.form.controls.yearModel.reset('');
    this.form.controls.yearModel.disable();
    this.resetFipeFields();

    const vehicleType = this.form.controls.vehicleType.value;
    this.facade.getModels(vehicleType, brandCode);

    if (vehicleType && brandCode) {
      this.form.controls.model.enable();
    }
  }

  onModelSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.modelSearch.set('');
    }
  }

  onModelChange(modelCode: string): void {
    this.form.controls.yearModel.reset('');
    this.form.controls.yearModel.disable();
    this.resetFipeFields();

    const vehicleType = this.form.controls.vehicleType.value;
    const brandCode = this.form.controls.brand.value;
    this.facade.getYears(vehicleType, brandCode, modelCode);

    if (vehicleType && brandCode && modelCode) {
      this.form.controls.yearModel.enable();
    }
  }

  onYearSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.yearSearch.set('');
    }
  }

  onYearChange(yearCode: string): void {
    this.selectFuelTypeFromFipeYear(yearCode);

    const vehicleType = this.form.controls.vehicleType.value;
    const brandCode = this.form.controls.brand.value;
    const modelCode = this.form.controls.model.value;

    this.facade.getFipeVehicleInfo(vehicleType, brandCode, modelCode, yearCode, (vehicleInfo) => {
      this.form.controls.fipeCode.setValue(
        this.getFipeInfoText(vehicleInfo, ['codeFipe', 'fipeCode', 'codigoFipe', 'codigo_fipe']),
      );
      this.form.controls.fipeValue.setValue(
        this.getFipeInfoText(vehicleInfo, ['price', 'value', 'valor', 'valorFipe', 'fipeValue']),
      );
    });
  }

  formatPlate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = formatPlateValue(input.value);

    input.value = value;
    this.form.controls.plate.setValue(value);
  }

  onlyFourDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = onlyDigits(input.value, 4);

    input.value = value;
    this.form.controls.yearManufacture.setValue(value ? Number(value) : null);
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

  formatMileage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = onlyDigits(input.value);

    input.value = value;
    this.form.controls.mileage.setValue(value ? Number(value) : null);
  }

  formatState(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = formatStateValue(input.value);

    input.value = value;
    this.form.controls.state.setValue(value);
  }

  formatPercent(
    event: Event,
    controlName: 'desiredProfitMarginPercent' | 'safetyMarginPercent',
  ): void {
    const input = event.target as HTMLInputElement;
    const digits = onlyDigits(input.value, 3);
    const value = digits ? Math.min(Number(digits), 100) : null;

    input.value = value === null ? '' : String(value);
    this.form.controls[controlName].setValue(value);
  }

  getYearLabel(year: YearsListResponse): string {
    return this.facade.getYearLabel(year);
  }

  submit(): void {
    this.submitError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildCreateVehiclePayload();

    if (!payload.type) {
      this.submitError = 'Tipo de veiculo invalido para cadastro.';
      return;
    }

    this.submitLoading = true;

    this.vehiclesService.createVehicle(payload).subscribe({
      next: (vehicle) => {
        this.submitLoading = false;
        void this.router.navigate(['/veiculos', vehicle.id]);
      },
      error: (error) => {
        console.error('Erro ao cadastrar veiculo', error);
        this.submitLoading = false;
        this.submitError = this.getCreateVehicleErrorMessage(error?.status);
      },
    });
  }

  private buildCreateVehiclePayload(): CreateVehicleRequest {
    const formValue = this.form.getRawValue();
    const selectedBrand = this.facade.brands().find((brand) => brand.code === formValue.brand);
    const selectedModel = this.facade.models().find((model) => model.code === formValue.model);
    const selectedYear = this.facade.years().find((year) => year.code === formValue.yearModel);

    return this.removeEmptyFields({
      plate: formValue.plate,
      brand: selectedBrand?.name,
      model: selectedModel?.name,
      yearManufacture: formValue.yearManufacture,
      yearModel: selectedYear ? this.getYearNumber(selectedYear.name) : undefined,
      color: formValue.color,
      fuelType: (formValue.fuelType || undefined) as CreateVehicleRequest['fuelType'],
      transmission: (formValue.transmission || undefined) as CreateVehicleRequest['transmission'],
      type: this.getBackendVehicleType(formValue.vehicleType),
      mileage: formValue.mileage,
      fipeCode: formValue.fipeCode,
      fipeValue: this.parseCurrency(formValue.fipeValue),
      marketValue: this.parseCurrency(formValue.marketValue),
      auctioneer: formValue.auctioneer,
      auctionType: (formValue.auctionType || undefined) as CreateVehicleRequest['auctionType'],
      sourceUrl: formValue.sourceUrl,
      eventDate: this.toIsoDate(formValue.eventDate),
      city: formValue.city,
      state: formValue.state,
      yardAddress: formValue.yardAddress,
      auctionInitialBid: this.parseCurrency(formValue.auctionInitialBid),
      auctionCurrentBid: this.parseCurrency(formValue.auctionCurrentBid),
      damageType: (formValue.damageType || 'NONE') as CreateVehicleRequest['damageType'],
      status: 'ANALYZING' as CreateVehicleRequest['status'],
      notes: formValue.notes,
    });
  }

  private formatCurrencyControl(
    event: Event,
    controlName: 'marketValue' | 'auctionInitialBid' | 'auctionCurrentBid',
  ): void {
    const input = event.target as HTMLInputElement;
    const digits = onlyDigits(input.value);

    if (!digits) {
      input.value = '';
      this.form.controls[controlName].setValue('');
      return;
    }

    const value = formatCurrencyBRL(Number(digits));
    input.value = value;
    this.form.controls[controlName].setValue(value);
  }

  private getBackendVehicleType(vehicleFipeType: VehicleFipeType | ''): VehicleType | undefined {
    const typeByFipeType: Partial<Record<VehicleFipeType, VehicleType>> = {
      cars: 'CAR',
      motorcycles: 'MOTORCYCLE',
    };

    return vehicleFipeType ? typeByFipeType[vehicleFipeType] : undefined;
  }

  private parseCurrency(value?: string | null): number | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toIsoDate(value?: string | null): string | undefined {
    return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
  }

  private getYearNumber(value: string): number | undefined {
    const year = value.match(/\d{4}/)?.[0];
    const parsed = year ? Number(year) : undefined;

    return parsed && Number.isFinite(parsed) ? parsed : undefined;
  }

  private removeEmptyFields<T extends Record<string, unknown>>(payload: T): T {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    ) as T;
  }

  private getCreateVehicleErrorMessage(status?: number): string {
    const messageByStatus: Record<number, string> = {
      400: 'Dados do veiculo invalidos. Revise os campos preenchidos.',
      401: 'Sessao expirada ou usuario nao autorizado.',
      403: 'Limite do plano gratis atingido.',
      429: 'Muitas requisicoes. Tente novamente em instantes.',
    };

    return status ? (messageByStatus[status] ?? 'Nao foi possivel cadastrar o veiculo.') : 'Nao foi possivel cadastrar o veiculo.';
  }

  private resetFipeFields(): void {
    this.form.controls.fipeCode.reset('');
    this.form.controls.fipeValue.reset('');
    this.facade.resetFipeInfo();
  }

  private selectFuelTypeFromFipeYear(yearCode: string): void {
    const selectedYear = this.facade.years().find((year) => year.code === yearCode);

    if (!selectedYear) {
      return;
    }

    const label = this.facade.getYearLabel(selectedYear).toLowerCase();
    const fuelCode = selectedYear.code.split('-').at(-1);
    const fuelType =
      label.includes('diesel') || fuelCode === '3'
        ? 'DIESEL'
        : label.includes('alcool') || label.includes('álcool') || fuelCode === '2'
          ? 'ETHANOL'
          : label.includes('flex')
            ? 'FLEX'
            : label.includes('gasolina') || fuelCode === '1'
              ? 'GASOLINE'
              : '';

    if (fuelType) {
      this.form.controls.fuelType.setValue(fuelType);
    }
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
