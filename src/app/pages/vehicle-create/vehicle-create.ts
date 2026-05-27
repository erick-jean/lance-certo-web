import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AUCTION_TYPE_OPTIONS } from '../../core/constants/auction-type-options';
import { DAMAGE_TYPE_OPTIONS } from '../../core/constants/damage-type-options';
import { FUEL_TYPE_OPTIONS } from '../../core/constants/fuel-type-options';
import { TRANSMISSION_OPTIONS } from '../../core/constants/transmission-options';
import { VEHICLE_TYPE_OPTIONS } from '../../core/constants/vehicle-type-options';
import { YearsListResponse } from '../../core/services/fipe';
import { Vehicles as VehiclesService } from '../../core/services/vehicles';
import { VehicleFipeType } from '../../core/types/vehicle-options.type';
import {
  formatCurrencyBRL,
  formatPlateValue,
  formatStateValue,
  onlyDigits,
} from '../../core/utils/form-formatters';
import { PageLoadingOverlay } from '../../shared/components/page-loading-overlay/page-loading-overlay';
import { VehicleAnalysisForm } from './components/vehicle-analysis-form/vehicle-analysis-form';
import { VehicleAuctionForm } from './components/vehicle-auction-form/vehicle-auction-form';
import { VehicleCreateHeaderComponent } from './components/vehicle-create-header/vehicle-create-header.component';
import { VehicleFormActions } from './components/vehicle-form-actions/vehicle-form-actions';
import { VehicleIdentificationForm } from './components/vehicle-identification-form/vehicle-identification-form';
import { createVehicleForm } from './vehicle-create.form';
import { getFipeCode, getFipeValue, getFuelTypeFromFipeYear } from './vehicle-create-fipe.helpers';
import { VehicleCreateFacade } from './vehicle-create.facade';
import { buildCreateVehiclePayload } from './vehicle-create-payload.mapper';

@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageLoadingOverlay,
    VehicleCreateHeaderComponent,
    VehicleIdentificationForm,
    VehicleAuctionForm,
    VehicleAnalysisForm,
    VehicleFormActions,
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

  /**
   * Manipula a mudança no campo de tipo de veículo. Reseta os campos dependentes (marca, modelo, ano e informações da FIPE)
   */
  getBrands(vehicleType: VehicleFipeType | ''): void {
    this.resetDependentFipeControls('brand');
    this.resetFipeFields();
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
      this.brandSearch.set('');
    }
  }

  /**
   * Manipula a mudança no campo de marca. Reseta os campos dependentes (modelo, ano e informações da FIPE)
   */
  onBrandChange(brandCode: string): void {
    this.resetDependentFipeControls('model');
    this.resetFipeFields();

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
      this.modelSearch.set('');
    }
  }

  /**
   * Manipula a mudança no campo de modelo. Reseta os campos dependentes
   * (ano e informações da FIPE) e busca os anos disponíveis para o modelo selecionado.
   */
  onModelChange(modelCode: string): void {
    this.resetDependentFipeControls('year');
    this.resetFipeFields();

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
      this.yearSearch.set('');
    }
  }

  /**
   * Manipula a mudança no campo de ano.
   * Seleciona o tipo de combustível com base no ano escolhido e atualiza as informações do veículo.
   */
  onYearChange(yearCode: string): void {
    this.selectFuelTypeFromFipeYear(yearCode);

    const vehicleType = this.form.controls.vehicleType.value;
    const brandCode = this.form.controls.brand.value;
    const modelCode = this.form.controls.model.value;

    this.facade.getFipeVehicleInfo(vehicleType, brandCode, modelCode, yearCode, (vehicleInfo) => {
      this.form.controls.fipeCode.setValue(getFipeCode(vehicleInfo));
      this.form.controls.fipeValue.setValue(getFipeValue(vehicleInfo));
    });
  }

  /**
   * Formata o campo de placa enquanto o usuário digita, aplicando a máscara de placa brasileira (ex: "ABC1D23").
   */
  formatPlate(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = formatPlateValue(input.value);

    input.value = value;
    this.form.controls.plate.setValue(value);
  }

  /**
   * Restringe o campo de ano de fabricação para aceitar apenas dígitos e limitar
   * a 4 caracteres, garantindo que o usuário insira um ano válido.
   */
  onlyFourDigits(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = onlyDigits(input.value, 4);

    input.value = value;
    this.form.controls.yearManufacture.setValue(value ? Number(value) : null);
  }

  /**
   * Normaliza campos monetários.
   * Aplica máscara de moeda brasileira no input e atualiza o FormControl
   * com o valor numérico correspondente.
   */

  formatMarketValue(event: Event): void {
    this.formatCurrencyControl(event, 'marketValue');
  }

  formatAuctionInitialBid(event: Event): void {
    this.formatCurrencyControl(event, 'auctionInitialBid');
  }

  formatAuctionCurrentBid(event: Event): void {
    this.formatCurrencyControl(event, 'auctionCurrentBid');
  }

  /**
   * Normaliza o campo de quilometragem.
   * Mantém apenas dígitos no input e salva o valor numérico no FormControl.
   */
  formatMileage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = onlyDigits(input.value);

    input.value = value;
    this.form.controls.mileage.setValue(value ? Number(value) : null);
  }

  /**
   * Formata o campo de estado para garantir que apenas letras sejam inseridas e
   * aplicando a formatação de placa (ex: "SP" para São Paulo).
   */
  formatState(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = formatStateValue(input.value);

    input.value = value;
    this.form.controls.state.setValue(value);
  }

  /**
   * Normaliza campos percentuais do formulário.
   * Mantém apenas números, limita o valor a 100 e atualiza o FormControl
   * com um número limpo, sem o símbolo de porcentagem.
   */
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

  readonly getYearLabel = (year: YearsListResponse): string => this.facade.getYearLabel(year);

  isPageLoading(): boolean {
    return this.fipeInfoLoading() || this.submitLoading;
  }

  loadingTitle(): string {
    return this.submitLoading ? 'Cadastrando veículo' : 'Buscando dados FIPE';
  }

  loadingDescription(): string {
    return this.submitLoading
      ? 'Aguarde enquanto salvamos o veículo no banco de dados.'
      : 'Aguarde enquanto carregamos o código e o valor FIPE.';
  }

  submit(): void {
    this.submitError = '';

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
      this.submitError = 'Tipo de veículo inválido para cadastro.';
      return;
    }

    this.submitLoading = true;

    this.vehiclesService.createVehicle(payload).subscribe({
      next: (vehicle) => {
        this.submitLoading = false;
        void this.router.navigate(['/veiculos', vehicle.id]);
      },
      error: (error) => {
        console.error('Erro ao cadastrar veículo', error);
        this.submitLoading = false;
        this.submitError = this.getCreateVehicleErrorMessage(error?.status);
      },
    });
  }

  /**
   * Formata os campos de valor monetário (valor de mercado, lance inicial e lance atual)
   * garantindo que apenas dígitos sejam inseridos e aplicando a formatação de moeda brasileira.
   */
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

  /**
   * Reseta os campos relacionados à FIPE (código, valor e erros) sem limpar as seleções de marca/modelo/ano.
   */
  private resetFipeFields(): void {
    this.form.controls.fipeCode.reset('');
    this.form.controls.fipeValue.reset('');
    this.facade.resetFipeInfo();
  }

  /**
   * Reseta e desabilita os campos dependentes de marca/modelo/ano quando uma seleção anterior é alterada.
   */
  private resetDependentFipeControls(from: 'brand' | 'model' | 'year'): void {
    if (from === 'brand') {
      this.form.controls.brand.reset('');
      this.form.controls.brand.disable();
    }

    if (from === 'brand' || from === 'model') {
      this.form.controls.model.reset('');
      this.form.controls.model.disable();
    }

    this.form.controls.yearModel.reset('');
    this.form.controls.yearModel.disable();
  }

  /**
   * Determina o tipo de combustível com base no código do ano selecionado na FIPE e atualiza o campo de combustível do formulário.
   */
  private selectFuelTypeFromFipeYear(yearCode: string): void {
    const selectedYear = this.facade.years().find((year) => year.code === yearCode);
    const fuelType = getFuelTypeFromFipeYear(
      selectedYear,
      selectedYear ? this.facade.getYearLabel(selectedYear) : '',
    );

    if (fuelType) {
      this.form.controls.fuelType.setValue(fuelType);
    }
  }
}
