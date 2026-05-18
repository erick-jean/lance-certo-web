import { Injectable } from '@angular/core';

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

export type DamageType = 'NONE' | 'LOW_DAMAGE' | 'MEDIUM_DAMAGE' | 'HIGH_DAMAGE' | 'FLOOD' | 'OTHER';

export type VehicleStatus = 'ANALYZING' | 'REJECTED' | 'PURCHASED' | 'SOLD';

@Injectable({
  providedIn: 'root',
})
export class Vehicles {}
