import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { buildApiUrl, normalizeApiBaseUrl } from '../utils/api';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface BrandsListResponse {
  code: string;
  name: string;
}

export interface ModelsListResponse {
  code: string;
  name: string;
}

export interface YearsListResponse {
  code: string;
  name: string;
}

export type VehicleType = 'cars' | 'motorcycles' | 'trucks';

export interface FipeVehicleInfoResponse {
  brand?: string;
  codeFipe?: string;
  fuel?: string;
  fuelAcronym?: string;
  fipeCode?: string;
  model?: string;
  modelYear?: number;
  price?: string;
  referenceMonth?: string;
  value?: string;
  year?: string | number;
  [key: string]: string | number | boolean | null | undefined;
}



@Injectable({
  providedIn: 'root',
})
export class FipeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = normalizeApiBaseUrl(environment.apiUrl);

  getBrands(vehicleType: VehicleType, reference?: number): Observable<BrandsListResponse[]> {
    const params: Record<string, string> = {};

    if (reference) {
      params['reference'] = String(reference);
    }

    return this.http.get<BrandsListResponse[]>(
      buildApiUrl(this.apiUrl, `/fipe/${vehicleType}/brands`),
      { params },
    );
  }

  getModels(
    vehicleType: VehicleType,
    brandId: string | number,
    reference?: number,
  ): Observable<ModelsListResponse[]> {
    const params: Record<string, string> = {};

    if (reference) {
      params['reference'] = String(reference);
    }

    return this.http.get<ModelsListResponse[]>(
      buildApiUrl(this.apiUrl, `/fipe/${vehicleType}/brands/${brandId}/models`),
      { params },
    );
  }

  getYears(
    vehicleType: VehicleType,
    brandId: string | number,
    modelId: string | number,
    reference?: number,
  ): Observable<YearsListResponse[]> {
    const params: Record<string, string> = {};

    if (reference) {
      params['reference'] = String(reference);
    }

    return this.http.get<YearsListResponse[]>(
      buildApiUrl(this.apiUrl, `/fipe/${vehicleType}/brands/${brandId}/models/${modelId}/years`),
      { params },
    );
  }

  getVehicleInfo(
    vehicleType: VehicleType,
    brandId: string | number,
    modelId: string | number,
    yearId: string,
    reference?: number,
  ): Observable<FipeVehicleInfoResponse> {
    const params: Record<string, string> = {};

    if (reference) {
      params['reference'] = String(reference);
    }

    return this.http.get<FipeVehicleInfoResponse>(
      buildApiUrl(
        this.apiUrl,
        `/fipe/${vehicleType}/brands/${brandId}/models/${modelId}/years/${yearId}`,
      ),
      { params },
    );
  }
}
