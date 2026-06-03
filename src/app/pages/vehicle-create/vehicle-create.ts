import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { map, of, switchMap, finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AUCTION_TYPE_OPTIONS } from '../../core/constants/auction-type-options';
import { DAMAGE_TYPE_OPTIONS } from '../../core/constants/damage-type-options';
import { FUEL_TYPE_OPTIONS } from '../../core/constants/fuel-type-options';
import { TRANSMISSION_OPTIONS } from '../../core/constants/transmission-options';
import { VEHICLE_TYPE_OPTIONS } from '../../core/constants/vehicle-type-options';
import { YearsListResponse } from '../../core/services/fipe';
import { Vehicles as VehiclesService } from '../../core/services/vehicles';
import { VehiclesCache } from '../../core/services/vehicles-cache';
import { DashboardCache } from '../../core/services/dashboard-cache';
import { VehicleFipeType } from '../../core/types/vehicle-options.type';
import { PageLoadingOverlay } from '../../shared/components/page-loading-overlay/page-loading-overlay';
import { FormCardComponent } from '../../shared/components/form-card/form-card';
import { VehicleAuctionFormComponent } from './components/vehicle-auction-form/vehicle-auction-form';
import {
  VehicleCreateErrorDialogComponent,
  VehicleCreateErrorDialogData,
} from './components/vehicle-create-error-dialog/vehicle-create-error-dialog';
import { VehicleCreateHeaderComponent } from './components/vehicle-create-header/vehicle-create-header.component';
import { VehicleFormActionsComponent } from './components/vehicle-form-actions/vehicle-form-actions';
import {
  VehicleCreateInfoDialogComponent,
  VEHICLE_CREATE_INFO_DISMISSED_KEY,
} from './components/vehicle-create-info-dialog/vehicle-create-info-dialog';
import { VehicleIdentificationFormComponent } from './components/vehicle-identification-form/vehicle-identification-form';
import { createVehicleForm } from './vehicle-create.form';
import { VehicleCreateFacade } from './vehicle-create.facade';
import { buildCreateVehiclePayload } from './vehicle-create-payload.mapper';
import { VehicleCreateFormService } from './vehicle-create-form.service';
import { VehicleIdentificationVm } from './models/vehicle-identification.vm';

type SubmitStep = 'vehicle' | 'images' | null;

const MAX_IMAGES = 10;

@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    PageLoadingOverlay,
    FormCardComponent,
    VehicleCreateHeaderComponent,
    VehicleIdentificationFormComponent,
    VehicleAuctionFormComponent,
    VehicleFormActionsComponent,
  ],
  templateUrl: './vehicle-create.html',
  styleUrl: './vehicle-create.scss',
  providers: [VehicleCreateFacade, VehicleCreateFormService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleCreate implements OnInit {
  readonly facade = inject(VehicleCreateFacade);
  private readonly formService = inject(VehicleCreateFormService);
  private readonly router = inject(Router);
  private readonly vehiclesCache = inject(VehiclesCache);
  private readonly dashboardCache = inject(DashboardCache);
  private readonly dialog = inject(MatDialog);
  private readonly vehiclesService = inject(VehiclesService);

  readonly form = createVehicleForm();
  readonly submitLoading = signal(false);
  readonly submitError = signal('');
  readonly submitStep = signal<SubmitStep>(null);

  /** Files selected by the user for upload. */
  readonly selectedImages = signal<File[]>([]);

  /** Object-URL previews derived from the selected files. */
  readonly imagePreviews = computed(() =>
    this.selectedImages().map((file) => URL.createObjectURL(file)),
  );

  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly fuelTypeOptions = FUEL_TYPE_OPTIONS;
  readonly transmissionOptions = TRANSMISSION_OPTIONS;
  readonly auctionTypeOptions = AUCTION_TYPE_OPTIONS;
  readonly damageTypeOptions = DAMAGE_TYPE_OPTIONS;

  readonly isPageLoading = computed(
    () => this.identificationVm.fipeInfo.loading() || this.submitLoading(),
  );

  readonly loadingTitle = computed(() => {
    switch (this.submitStep()) {
      case 'vehicle':
        return 'Cadastrando veículo';
      case 'images':
        return 'Enviando fotos';
      default:
        return 'Buscando dados FIPE';
    }
  });

  readonly loadingDescription = computed(() => {
    switch (this.submitStep()) {
      case 'vehicle':
        return 'Aguarde enquanto salvamos o veículo no banco de dados.';
      case 'images':
        return `Enviando ${this.selectedImages().length} foto(s) do veículo.`;
      default:
        return 'Aguarde enquanto carregamos o código e o valor FIPE.';
    }
  });

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  ngOnInit(): void {
    const dismissed = localStorage.getItem(VEHICLE_CREATE_INFO_DISMISSED_KEY);
    if (!dismissed) {
      this.dialog.open(VehicleCreateInfoDialogComponent, {
        panelClass: 'vehicle-create-info-dialog-panel',
        disableClose: true,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Image upload
  // ---------------------------------------------------------------------------

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);
    const current = this.selectedImages();
    const available = MAX_IMAGES - current.length;

    if (available > 0) {
      this.selectedImages.set([...current, ...newFiles.slice(0, available)]);
    }

    // Reset so the same file can be picked again after removal
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages.update((images) => images.filter((_, i) => i !== index));
  }

  // ---------------------------------------------------------------------------
  // FIPE cascade
  // ---------------------------------------------------------------------------

  getBrands(vehicleType: VehicleFipeType | ''): void {
    this.formService.resetDependentFipeControls(this.form, 'brand');
    this.formService.resetFipeFields(this.form);
    this.facade.getBrands(vehicleType);

    if (vehicleType) this.form.controls.brand.enable();
  }

  onBrandSelectOpenedChange(opened: boolean): void {
    if (!opened) this.identificationVm.brands.search.set('');
  }

  onBrandChange(brandCode: string): void {
    this.formService.resetDependentFipeControls(this.form, 'model');
    this.formService.resetFipeFields(this.form);

    const vehicleType = this.form.controls.vehicleType.value;
    this.facade.getModels(vehicleType, brandCode);

    if (vehicleType && brandCode) this.form.controls.model.enable();
  }

  onModelSelectOpenedChange(opened: boolean): void {
    if (!opened) this.identificationVm.models.search.set('');
  }

  onModelChange(modelCode: string): void {
    this.formService.resetDependentFipeControls(this.form, 'year');
    this.formService.resetFipeFields(this.form);

    const vehicleType = this.form.controls.vehicleType.value;
    const brandCode = this.form.controls.brand.value;
    this.facade.getYears(vehicleType, brandCode, modelCode);

    if (vehicleType && brandCode && modelCode) this.form.controls.yearModel.enable();
  }

  onYearSelectOpenedChange(opened: boolean): void {
    if (!opened) this.identificationVm.years.search.set('');
  }

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

  // ---------------------------------------------------------------------------
  // Submit — sequential chain: createVehicle → createEvaluation → addImages
  // Any failure stops the chain and shows the error dialog.
  // ---------------------------------------------------------------------------

  submit(): void {
    this.submitError.set('');

    if (this.submitLoading()) return;

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

    const images = this.selectedImages();

    this.submitLoading.set(true);
    this.submitStep.set('vehicle');

    this.vehiclesService
      .createVehicle(payload)
      .pipe(
        // Step 2: upload images (only if the user selected any)
        switchMap((vehicle) => {
          if (!images.length) return of(vehicle);

          this.submitStep.set('images');
          return this.vehiclesService.addImages(vehicle.id, images).pipe(map(() => vehicle));
        }),
        finalize(() => {
          this.submitLoading.set(false);
          this.submitStep.set(null);
        }),
      )
      .subscribe({
        next: (vehicle) => {
          this.vehiclesCache.invalidate();
          this.dashboardCache.invalidate();
          void this.router.navigate(['/veiculos', vehicle.id]);
        },
        error: (error: HttpErrorResponse) => {
          const dialogData = this.buildCreateVehicleErrorDialog(error);
          this.submitError.set(dialogData.message);
          this.openCreateVehicleErrorDialog(dialogData);
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

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
      title: 'Não foi possível concluir o cadastro',
      message,
      icon: 'error_outline',
    };
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    const responseError = error.error as { message?: unknown } | null;
    const message = responseError?.message;

    if (typeof message === 'string') return message;

    if (Array.isArray(message)) {
      return message.filter((item): item is string => typeof item === 'string').join(' ');
    }

    return '';
  }

  // ---------------------------------------------------------------------------
  // VM for identification form
  // ---------------------------------------------------------------------------

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
