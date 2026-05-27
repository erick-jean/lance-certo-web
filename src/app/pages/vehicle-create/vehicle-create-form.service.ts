import { inject, Injectable } from '@angular/core';

import { FipeVehicleInfoResponse } from '../../core/services/fipe';
import { VehicleCreateForm } from './vehicle-create.form';
import { getFipeCode, getFipeValue, getFuelTypeFromFipeYear } from './vehicle-create-fipe.helpers';
import { VehicleCreateFacade } from './vehicle-create.facade';

type FipeResetPoint = 'brand' | 'model' | 'year';

@Injectable()
export class VehicleCreateFormService {
  private readonly facade = inject(VehicleCreateFacade);

  /**
   * Limpa os campos calculados da FIPE sem alterar as seleções de tipo, marca, modelo ou ano.
   */
  resetFipeFields(form: VehicleCreateForm): void {
    form.controls.fipeCode.reset('');
    form.controls.fipeValue.reset('');

    this.facade.resetFipeInfo();
  }

  /**
   * Limpa e desabilita os campos dependentes da cadeia FIPE.
   *
   * Fluxo:
   * tipo -> marca -> modelo -> ano -> dados FIPE
   */
  resetDependentFipeControls(form: VehicleCreateForm, from: FipeResetPoint): void {
    if (from === 'brand') {
      form.controls.brand.reset('');
      form.controls.brand.disable();
    }

    if (from === 'brand' || from === 'model') {
      form.controls.model.reset('');
      form.controls.model.disable();
    }

    form.controls.yearModel.reset('');
    form.controls.yearModel.disable();
  }

  /**
   * Define o combustível automaticamente com base no ano selecionado na FIPE.
   */
  selectFuelTypeFromFipeYear(form: VehicleCreateForm, yearCode: string): void {
    const selectedYear = this.facade.years().find((year) => year.code === yearCode);

    const fuelType = getFuelTypeFromFipeYear(
      selectedYear,
      selectedYear ? this.facade.getYearLabel(selectedYear) : '',
    );

    if (fuelType) {
      form.controls.fuelType.setValue(fuelType);
    }
  }

  /**
   * Aplica código FIPE e valor FIPE retornados pela API no formulário.
   */
  applyFipeVehicleInfo(form: VehicleCreateForm, vehicleInfo: FipeVehicleInfoResponse): void {
    form.controls.fipeCode.setValue(getFipeCode(vehicleInfo));
    form.controls.fipeValue.setValue(getFipeValue(vehicleInfo));
  }
}
