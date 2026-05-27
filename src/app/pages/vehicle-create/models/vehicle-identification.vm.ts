import { Signal, WritableSignal } from '@angular/core';

import {
  BrandsListResponse,
  ModelsListResponse,
  YearsListResponse,
} from '../../../core/services/fipe';

export interface SelectVm<T> {
  items: Signal<T[]>;
  loading: Signal<boolean>;
  error: Signal<string>;
  search: WritableSignal<string>;
}

export interface YearSelectVm extends SelectVm<YearsListResponse> {
  optionLabelFn: (year: YearsListResponse) => string;
}

export interface VehicleIdentificationVm {
  brands: SelectVm<BrandsListResponse>;
  models: SelectVm<ModelsListResponse>;
  years: YearSelectVm;
  fipeInfo: {
    loading: Signal<boolean>;
    error: Signal<string>;
  };
}
