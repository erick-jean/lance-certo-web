import { Component, inject, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AUCTION_TYPE_OPTIONS } from '../../core/constants/auction-type-options';
import { DAMAGE_TYPE_OPTIONS } from '../../core/constants/damage-type-options';
import { FUEL_TYPE_OPTIONS } from '../../core/constants/fuel-type-options';
import { TRANSMISSION_OPTIONS } from '../../core/constants/transmission-options';
import { VEHICLE_TYPE_OPTIONS } from '../../core/constants/vehicle-type-options';
import { YearsListResponse } from '../../core/services/fipe';
import { Vehicles as VehiclesService } from '../../core/services/vehicles';
import { VehiclesCache } from '../../core/services/vehicles-cache';
import { VehicleFipeType } from '../../core/types/vehicle-options.type';
import { PageLoadingOverlay } from '../../shared/components/page-loading-overlay/page-loading-overlay';
import { VehicleAnalysisFormComponent } from './components/vehicle-analysis-form/vehicle-analysis-form';
import { VehicleAuctionFormComponent } from './components/vehicle-auction-form/vehicle-auction-form';
import {
  VehicleCreateErrorDialogComponent,
  VehicleCreateErrorDialogData,
} from './components/vehicle-create-error-dialog/vehicle-create-error-dialog';
import { VehicleCreateHeaderComponent } from './components/vehicle-create-header/vehicle-create-header.component';
import { VehicleFormActionsComponent } from './components/vehicle-form-actions/vehicle-form-actions';
import { VehicleIdentificationFormComponent } from './components/vehicle-identification-form/vehicle-identification-form';
import { createVehicleForm } from './vehicle-create.form';
import { VehicleCreateFacade } from './vehicle-create.facade';
import { buildCreateVehiclePayload } from './vehicle-create-payload.mapper';
import { VehicleCreateFormService } from './vehicle-create-form.service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { VehicleIdentificationVm } from './models/vehicle-identification.vm';

@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    PageLoadingOverlay,
    VehicleCreateHeaderComponent,
    VehicleIdentificationFormComponent,
    VehicleAuctionFormComponent,
    VehicleAnalysisFormComponent,
    VehicleFormActionsComponent,
  ],
  templateUrl: './vehicle-create.html',
  styleUrl: './vehicle-create.scss',
  providers: [VehicleCreateFacade, VehicleCreateFormService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleCreate {
  readonly facade = inject(VehicleCreateFacade);
  private readonly formService = inject(VehicleCreateFormService);
  private readonly router = inject(Router);
  private readonly vehiclesCache = inject(VehiclesCache);
  private readonly dialog = inject(MatDialog);
  private readonly vehiclesService = inject(VehiclesService);

  readonly form = createVehicleForm();
  readonly submitLoading = signal(false);
  readonly submitError = signal('');

  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly fuelTypeOptions = FUEL_TYPE_OPTIONS;
  readonly transmissionOptions = TRANSMISSION_OPTIONS;
  readonly auctionTypeOptions = AUCTION_TYPE_OPTIONS;
  readonly damageTypeOptions = DAMAGE_TYPE_OPTIONS;

  /**
   * Reinicia a cadeia FIPE ao alterar o tipo do veículo.
   */
  getBrands(vehicleType: VehicleFipeType | ''): void {
    this.formService.resetDependentFipeControls(this.form, 'brand');
    this.formService.resetFipeFields(this.form);

    this.facade.getBrands(vehicleType);

    if (vehicleType) {
      this.form.controls.brand.enable();
    }
  }

  /**
   * Limpa o campo de busca de marca quando a dropdown de seleção de marca é fechada,
   * garantindo que a lista de marcas seja exibida completa na próxima abertura.
   */
  onBrandSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.identificationVm.brands.search.set('');
    }
  }

  /**
   * Reinicia modelo, ano e dados FIPE ao alterar a marca.
   */
  onBrandChange(brandCode: string): void {
    this.formService.resetDependentFipeControls(this.form, 'model');
    this.formService.resetFipeFields(this.form);

    const vehicleType = this.form.controls.vehicleType.value;
    this.facade.getModels(vehicleType, brandCode);

    if (vehicleType && brandCode) {
      this.form.controls.model.enable();
    }
  }

  /**
   * Limpa o campo de busca de modelo quando a dropdown de seleção de modelo é fechada,
   */
  onModelSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.identificationVm.models.search.set('');
    }
  }

  /**
   * Reinicia ano e dados FIPE ao alterar o modelo.
   */
  onModelChange(modelCode: string): void {
    this.formService.resetDependentFipeControls(this.form, 'year');
    this.formService.resetFipeFields(this.form);

    const vehicleType = this.form.controls.vehicleType.value;
    const brandCode = this.form.controls.brand.value;
    this.facade.getYears(vehicleType, brandCode, modelCode);

    if (vehicleType && brandCode && modelCode) {
      this.form.controls.yearModel.enable();
    }
  }

  /**
   * Limpa o campo de busca de ano quando a dropdown de seleção de ano é fechada,
   * garantindo que a lista de anos seja exibida completa na próxima abertura.
   */
  onYearSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.identificationVm.years.search.set('');
    }
  }

  /**
   * Busca os dados FIPE e tenta inferir o combustível pelo ano selecionado.
   */
  onYearChange(yearCode: string): void {
    this.formService.selectFuelTypeFromFipeYear(this.form, yearCode);

    const vehicleType = this.form.controls.vehicleType.value;
    const brandCode = this.form.controls.brand.value;
    const modelCode = this.form.controls.model.value;

    this.facade.getFipeVehicleInfo(vehicleType, brandCode, modelCode, yearCode, (vehicleInfo) => {
      this.formService.applyFipeVehicleInfo(this.form, vehicleInfo);
    });
  }

  readonly getYearLabel = (year: YearsListResponse): string => this.facade.getYearLabel(year);

  readonly isPageLoading = computed(
    () => this.identificationVm.fipeInfo.loading() || this.submitLoading(),
  );

  readonly loadingTitle = computed(() =>
    this.submitLoading() ? 'Cadastrando veículo' : 'Buscando dados FIPE',
  );

  readonly loadingDescription = computed(() => {
    return this.submitLoading()
      ? 'Aguarde enquanto salvamos o veículo no banco de dados.'
      : 'Aguarde enquanto carregamos o código e o valor FIPE.';
  });

  submit(): void {
    this.submitError.set('');

    if (this.submitLoading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = buildCreateVehiclePayload({
      formValue: this.form.getRawValue(),
      brands: this.facade.brands(),
      models: this.facade.models(),
      years: this.facade.years(),
    });

    if (!payload.type) {
      this.submitError.set('Tipo de veículo inválido para cadastro.');
      return;
    }

    this.submitLoading.set(true);

    this.vehiclesService
      .createVehicle(payload)
      .pipe(finalize(() => this.submitLoading.set(false)))
      .subscribe({
        next: (vehicle) => {
          this.vehiclesCache.invalidate(); // force fresh list on next visit
          void this.router.navigate(['/veiculos', vehicle.id]);
        },
        error: (error: HttpErrorResponse) => {
          const dialogData = this.buildCreateVehicleErrorDialog(error);

          this.submitError.set(dialogData.message);
          this.openCreateVehicleErrorDialog(dialogData);
        },
      });
  }

  /**
   * Retorna mensagens de erro específicas para falhas no cadastro de veículo, com base no status HTTP da resposta.
   * Isso permite fornecer feedback mais claro e direcionado ao usuário, ajudando-o a entender o motivo da falha e como corrigi-la.
   * Se o status não for reconhecido, uma mensagem genérica de erro é retornada.
   */
  private getCreateVehicleErrorMessage(status?: number): string {
    const messageByStatus: Record<number, string> = {
      400: 'Dados do veículo inválidos. Revise os campos preenchidos.',
      401: 'Sessão expirada ou usuário não autorizado.',
      403: 'Limite do plano grátis atingido.',
      429: 'Muitas requisições. Tente novamente em instantes.',
    };

    return status
      ? (messageByStatus[status] ?? 'Não foi possível cadastrar o veículo.')
      : 'Não foi possível cadastrar o veículo.';
  }

  private openCreateVehicleErrorDialog(data: VehicleCreateErrorDialogData): void {
    this.dialog.open(VehicleCreateErrorDialogComponent, {
      data,
      autoFocus: 'dialog',
      panelClass: 'vehicle-create-error-dialog-panel',
    });
  }

  private buildCreateVehicleErrorDialog(error: HttpErrorResponse): VehicleCreateErrorDialogData {
    const message =
      this.getApiErrorMessage(error) || this.getCreateVehicleErrorMessage(error.status);

    if (error.status === 403) {
      return {
        title: 'Limite do plano grátis atingido',
        message,
        icon: 'workspace_premium',
        actionLabel: 'Ver assinatura',
        actionRoute: '/assinatura',
      };
    }

    return {
      title: 'Não foi possível cadastrar o veículo',
      message,
      icon: 'error_outline',
    };
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    const responseError = error.error as { message?: unknown } | null;
    const message = responseError?.message;

    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message)) {
      return message.filter((item): item is string => typeof item === 'string').join(' ');
    }

    return '';
  }

  // VM para gerenciamento do estado da identificação do veículo e dados FIPE.
  readonly identificationVm: VehicleIdentificationVm = {
    brands: {
      items: this.facade.filteredBrands,
      loading: this.facade.brandsLoading,
      error: this.facade.brandsError,
      search: this.facade.brandSearch,
    },

    models: {
      items: this.facade.filteredModels,
      loading: this.facade.modelsLoading,
      error: this.facade.modelsError,
      search: this.facade.modelSearch,
    },

    years: {
      items: this.facade.filteredYears,
      loading: this.facade.yearsLoading,
      error: this.facade.yearsError,
      search: this.facade.yearSearch,
      optionLabelFn: (year) => this.facade.getYearLabel(year),
    },

    fipeInfo: {
      loading: this.facade.fipeInfoLoading,
      error: this.facade.fipeInfoError,
    },
  };
}
