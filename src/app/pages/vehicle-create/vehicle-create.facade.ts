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

  /**
   * Controla a versão da última requisição de cada nível da cadeia FIPE.
   * Isso impede que uma resposta antiga sobrescreva dados mais recentes na tela.
   */
  private brandsRequestId = 0;
  private modelsRequestId = 0;
  private yearsRequestId = 0;
  private fipeInfoRequestId = 0;

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

  /**
   * Busca as marcas disponíveis para o tipo de veículo selecionado.
   * Ao trocar o tipo, toda a cadeia FIPE abaixo dele deixa de ser válida.
   */
  getBrands(vehicleType: VehicleFipeType | ''): void {
    const requestId = ++this.brandsRequestId;

    this.invalidateDependentRequestsFromBrand();
    this.resetBrands();
    this.resetModels();
    this.resetYears();
    this.resetFipeInfo();

    if (!vehicleType) {
      return;
    }

    this.brandsLoading.set(true);

    this.fipeService
      .getBrands(vehicleType)
      .pipe(
        finalize(() => {
          if (this.isCurrentBrandsRequest(requestId)) {
            this.brandsLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (brands) => {
          if (!this.isCurrentBrandsRequest(requestId)) {
            return;
          }

          this.brands.set(brands);
        },
        error: () => {
          if (!this.isCurrentBrandsRequest(requestId)) {
            return;
          }

          this.brands.set([]);
          this.brandsError.set('Não foi possível carregar as marcas.');
        },
      });
  }

  /**
   * Busca os modelos da marca selecionada.
   * Ao trocar a marca, modelo, ano e dados FIPE precisam ser descartados.
   */
  getModels(vehicleType: VehicleFipeType | '', brandCode: string): void {
    const requestId = ++this.modelsRequestId;

    this.invalidateDependentRequestsFromModel();
    this.resetModels();
    this.resetYears();
    this.resetFipeInfo();

    if (!vehicleType || !brandCode) {
      return;
    }

    this.modelsLoading.set(true);

    this.fipeService
      .getModels(vehicleType, brandCode)
      .pipe(
        finalize(() => {
          if (this.isCurrentModelsRequest(requestId)) {
            this.modelsLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (models) => {
          if (!this.isCurrentModelsRequest(requestId)) {
            return;
          }

          this.models.set(models);
        },
        error: () => {
          if (!this.isCurrentModelsRequest(requestId)) {
            return;
          }

          this.models.set([]);
          this.modelsError.set('Não foi possível carregar os modelos.');
        },
      });
  }

  /**
   * Busca os anos disponíveis para o modelo selecionado.
   * Ao trocar o modelo, o ano e os dados FIPE anteriores deixam de ser confiáveis.
   */
  getYears(vehicleType: VehicleFipeType | '', brandCode: string, modelCode: string): void {
    const requestId = ++this.yearsRequestId;

    this.invalidateDependentRequestsFromYear();
    this.resetYears();
    this.resetFipeInfo();

    if (!vehicleType || !brandCode || !modelCode) {
      return;
    }

    this.yearsLoading.set(true);

    this.fipeService
      .getYears(vehicleType, brandCode, modelCode)
      .pipe(
        finalize(() => {
          if (this.isCurrentYearsRequest(requestId)) {
            this.yearsLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (years) => {
          if (!this.isCurrentYearsRequest(requestId)) {
            return;
          }

          this.years.set(years);
        },
        error: () => {
          if (!this.isCurrentYearsRequest(requestId)) {
            return;
          }

          this.years.set([]);
          this.yearsError.set('Não foi possível carregar os anos.');
        },
      });
  }

  /**
   * Busca código e valor FIPE do veículo selecionado.
   * Usa requestId para ignorar respostas antigas quando o usuário troca o ano rapidamente.
   */
  getFipeVehicleInfo(
    vehicleType: VehicleFipeType | '',
    brandCode: string,
    modelCode: string,
    yearCode: string,
    onSuccess: (vehicleInfo: FipeVehicleInfoResponse) => void,
  ): void {
    const requestId = ++this.fipeInfoRequestId;

    this.resetFipeInfo();

    if (!vehicleType || !brandCode || !modelCode || !yearCode) {
      return;
    }

    this.fipeInfoLoading.set(true);

    this.fipeService
      .getVehicleInfo(vehicleType, brandCode, modelCode, yearCode)
      .pipe(
        finalize(() => {
          if (this.isCurrentFipeInfoRequest(requestId)) {
            this.fipeInfoLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (vehicleInfo) => {
          if (!this.isCurrentFipeInfoRequest(requestId)) {
            return;
          }

          onSuccess(vehicleInfo);
        },
        error: () => {
          if (!this.isCurrentFipeInfoRequest(requestId)) {
            return;
          }

          this.fipeInfoError.set('Não foi possível carregar os dados FIPE.');
        },
      });
  }

  /**
   * Limpa marcas e estado visual relacionado à busca de marcas.
   */
  resetBrands(): void {
    this.brands.set([]);
    this.brandsError.set('');
    this.brandSearch.set('');
    this.brandsLoading.set(false);
  }

  /**
   * Limpa modelos e estado visual relacionado à busca de modelos.
   */
  resetModels(): void {
    this.models.set([]);
    this.modelsError.set('');
    this.modelSearch.set('');
    this.modelsLoading.set(false);
  }

  /**
   * Limpa anos e estado visual relacionado à busca de anos.
   */
  resetYears(): void {
    this.years.set([]);
    this.yearsError.set('');
    this.yearSearch.set('');
    this.yearsLoading.set(false);
  }

  /**
   * Limpa somente o estado da consulta final de código e valor FIPE.
   */
  resetFipeInfo(): void {
    this.fipeInfoError.set('');
    this.fipeInfoLoading.set(false);
  }

  /**
   * Monta o label do ano com combustível quando a FIPE retorna apenas o código no sufixo.
   */
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

  /**
   * Invalida chamadas pendentes de modelo, ano e dados FIPE.
   */
  private invalidateDependentRequestsFromBrand(): void {
    this.modelsRequestId++;
    this.yearsRequestId++;
    this.fipeInfoRequestId++;
  }

  /**
   * Invalida chamadas pendentes de ano e dados FIPE.
   */
  private invalidateDependentRequestsFromModel(): void {
    this.yearsRequestId++;
    this.fipeInfoRequestId++;
  }

  /**
   * Invalida chamadas pendentes da consulta final FIPE.
   */
  private invalidateDependentRequestsFromYear(): void {
    this.fipeInfoRequestId++;
  }

  private isCurrentBrandsRequest(requestId: number): boolean {
    return requestId === this.brandsRequestId;
  }

  private isCurrentModelsRequest(requestId: number): boolean {
    return requestId === this.modelsRequestId;
  }

  private isCurrentYearsRequest(requestId: number): boolean {
    return requestId === this.yearsRequestId;
  }

  private isCurrentFipeInfoRequest(requestId: number): boolean {
    return requestId === this.fipeInfoRequestId;
  }
}
