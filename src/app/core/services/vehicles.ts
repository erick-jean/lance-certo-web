import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface VehicleFilters {
  page?: number;
  limit?: number;
  status?: VehicleStatus;
  brand?: string;
  model?: string;
  plate?: string;
}

export interface VehicleListResponse {
  data: Vehicle[];
  meta: PaginationMeta;
}

export interface Vehicle {
  id: string;
  userId: string;
  plate: string;
  brand: string;
  model: string;
  version: string;
  yearManufacture: number;
  yearModel: number;
  color: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  type: VehicleType;
  mileage: number;
  fipeCode: string;
  fipeValue: number;
  marketValue: number;
  auctioneer: string;
  auctionType: AuctionType;
  sourceUrl: string;
  eventDate: string;
  city: string;
  state: string;
  yardAddress: string;
  auctionInitialBid: number;
  auctionCurrentBid: number;
  purchasePrice: number;
  purchasedAt: string | null;
  soldPrice: number | null;
  soldAt: string | null;
  damageType: DamageType;
  status: VehicleStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type FuelType = 'FLEX' | 'GASOLINE' | 'ETHANOL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'GNV';

export type TransmissionType = 'MANUAL' | 'AUTOMATIC' | 'CVT';

export type VehicleType = 'CAR' | 'MOTORCYCLE';

export type AuctionType = 'JUDICIAL' | 'EXTRAJUDICIAL' | 'BANK' | 'INSURANCE' | 'OTHER';

export type DamageType =
  | 'NONE'
  | 'LOW_DAMAGE'
  | 'MEDIUM_DAMAGE'
  | 'HIGH_DAMAGE'
  | 'FLOOD'
  | 'OTHER';

export type VehicleStatus = 'ANALYZING' | 'REJECTED' | 'PURCHASED' | 'SOLD';

@Injectable({
  providedIn: 'root',
})
export class Vehicles {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getVehicles(filters: VehicleFilters = {}) {
    let params = new HttpParams();

    if (filters.page) {
      params = params.set('page', filters.page);
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.brand) {
      params = params.set('brand', filters.brand);
    }
    if (filters.model) {
      params = params.set('model', filters.model);
    }
    if (filters.plate) {
      params = params.set('plate', filters.plate);
    }

    return this.http.get<VehicleListResponse>(`${this.apiUrl}/vehicles`, { params });
  }
}
