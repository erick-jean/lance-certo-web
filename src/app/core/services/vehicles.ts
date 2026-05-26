import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { buildApiUrl, normalizeApiBaseUrl } from '../utils/api';
import { VehicleType } from '../types/vehicle-options.type';
import { AuctionType } from '../types/auction-options.type';
import { FuelType } from '../types/fuel-options.type';
import { TransmissionType } from '../types/transmission-options.type';
import { DamageType } from '../types/damage-options.type';

export type { VehicleType } from '../types/vehicle-options.type';
export type { AuctionType } from '../types/auction-options.type';
export type { FuelType } from '../types/fuel-options.type';
export type { TransmissionType } from '../types/transmission-options.type';
export type { DamageType } from '../types/damage-options.type';

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
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  yearManufacture?: number | null;
  yearModel?: number | null;
  color?: string | null;
  fuelType?: FuelType | null;
  transmission?: TransmissionType | null;
  type: VehicleType;
  mileage?: number | null;
  fipeCode?: string | null;
  fipeValue?: number | null;
  marketValue?: number | null;
  auctioneer?: string | null;
  auctionType?: AuctionType | null;
  sourceUrl?: string | null;
  eventDate?: string | null;
  city?: string | null;
  state?: string | null;
  yardAddress?: string | null;
  auctionInitialBid?: number | null;
  auctionCurrentBid?: number | null;
  purchasePrice?: number | null;
  purchasedAt?: string | null;
  soldPrice?: number | null;
  soldAt?: string | null;
  damageType: DamageType;
  status: VehicleStatus;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  images?: VehicleImage[];
  evaluation?: VehicleEvaluation | null;
}

export interface VehicleImage {
  id: string;
  vehicleId?: string;
  url: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  createdAt?: string;
}

export interface VehicleEvaluation {
  id: string;
  vehicleId: string;
  desiredProfitMarginPercent?: number | null;
  safetyMarginPercent?: number | null;
  maxRecommendedBid?: number | null;
  estimatedFinalCost?: number | null;
  estimatedProfit?: number | null;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  recommendation?: 'RECOMMENDED' | 'CAUTION' | 'NOT_RECOMMENDED' | null;
  isComplete: boolean;
  lastCalculatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  evaluationChecklistItems?: EvaluationChecklistItem[];
  evaluationExpenses?: EvaluationExpense[];
  suggestedBid?: number | null;
  estimatedExpenses?: number | null;
  expenses?: EvaluationExpense[];
}

export interface EvaluationChecklistItem {
  id: string;
  evaluationId: string;
  name: string;
  isChecked: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationExpense {
  id: string;
  evaluationId: string;
  category: ExpenseCategory;
  source: ExpenseSource;
  name: string;
  amount: number;
  isRequired: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFinancialSummary {
  vehicleId: string;
  purchasePrice?: number | null;
  purchasedAt?: string | null;
  totalExpenses: number;
  totalInvestment: number;
  soldPrice?: number | null;
  soldAt?: string | null;
  grossProfit?: number | null;
  profitMarginPercent?: number | null;
  isSold: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type CreateVehicleRequest = Partial<
  Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'images' | 'evaluation'>
>;
export type UpdateVehicleRequest = CreateVehicleRequest;

export interface PurchaseVehicleRequest {
  purchasePrice: number;
  purchasedAt?: string;
}

export interface SellVehicleRequest {
  soldPrice: number;
  soldAt?: string;
}

export interface VehicleEvaluationRequest {
  desiredProfitMarginPercent?: number | null;
  safetyMarginPercent?: number | null;
}

export interface EvaluationExpenseRequest {
  category: ExpenseCategory;
  name: string;
  amount: number;
  isRequired: boolean;
  notes?: string | null;
}

export interface UpdateEvaluationChecklistItemRequest {
  isChecked?: boolean;
  notes?: string | null;
}

export type VehicleStatus = 'ANALYZING' | 'REJECTED' | 'PURCHASED' | 'SOLD';

export type ExpenseCategory =
  | 'DOCUMENTATION'
  | 'REPAIR'
  | 'AUCTION_FEE'
  | 'TRANSPORT'
  | 'INSPECTION'
  | 'DEBT'
  | 'REGULARIZATION'
  | 'PREPARATION_SALE'
  | 'OTHER';

export type ExpenseSource = 'USER' | 'SYSTEM' | 'CHECKLIST' | 'AUCTION_RULE' | 'DOCUMENTATION_RULE';

@Injectable({
  providedIn: 'root',
})
export class Vehicles {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = normalizeApiBaseUrl(environment.apiUrl);

  getVehicles(filters: VehicleFilters = {}): Observable<VehicleListResponse> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<VehicleListResponse>(buildApiUrl(this.apiUrl, '/vehicles'), { params });
  }

  getVehicle(vehicleId: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}`));
  }

  createVehicle(payload: CreateVehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(buildApiUrl(this.apiUrl, '/vehicles'), payload);
  }

  updateVehicle(vehicleId: string, payload: UpdateVehicleRequest): Observable<Vehicle> {
    return this.http.patch<Vehicle>(buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}`), payload);
  }

  deleteVehicle(vehicleId: string): Observable<void> {
    return this.http.delete<void>(buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}`));
  }

  markAsPurchased(vehicleId: string, payload: PurchaseVehicleRequest): Observable<Vehicle> {
    return this.http.patch<Vehicle>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/purchase`),
      payload,
    );
  }

  markAsSold(vehicleId: string, payload: SellVehicleRequest): Observable<Vehicle> {
    return this.http.patch<Vehicle>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/sale`),
      payload,
    );
  }

  getFinancialSummary(vehicleId: string): Observable<VehicleFinancialSummary> {
    return this.http.get<VehicleFinancialSummary>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/financial-summary`),
    );
  }

  getImages(vehicleId: string): Observable<VehicleImage[]> {
    return this.http.get<VehicleImage[]>(buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/images`));
  }

  addImages(vehicleId: string, files: File[]): Observable<VehicleImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return this.http.post<VehicleImage[]>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/images`),
      formData,
    );
  }

  deleteImage(vehicleId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/images/${imageId}`),
    );
  }

  createEvaluation(
    vehicleId: string,
    payload: VehicleEvaluationRequest,
  ): Observable<VehicleEvaluation> {
    return this.http.post<VehicleEvaluation>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation`),
      payload,
    );
  }

  getEvaluation(vehicleId: string): Observable<VehicleEvaluation> {
    return this.http.get<VehicleEvaluation>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation`),
    );
  }

  updateEvaluation(
    vehicleId: string,
    payload: VehicleEvaluationRequest,
  ): Observable<VehicleEvaluation> {
    return this.http.patch<VehicleEvaluation>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation`),
      payload,
    );
  }

  deleteEvaluation(vehicleId: string): Observable<void> {
    return this.http.delete<void>(buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation`));
  }

  getEvaluationChecklist(vehicleId: string): Observable<EvaluationChecklistItem[]> {
    return this.http.get<EvaluationChecklistItem[]>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation/checklist`),
    );
  }

  updateEvaluationChecklistItem(
    vehicleId: string,
    checklistItemId: string,
    payload: UpdateEvaluationChecklistItemRequest,
  ): Observable<EvaluationChecklistItem> {
    return this.http.patch<EvaluationChecklistItem>(
      buildApiUrl(
        this.apiUrl,
        `/vehicles/${vehicleId}/evaluation/checklist-items/${checklistItemId}`,
      ),
      payload,
    );
  }

  getEvaluationExpenses(vehicleId: string): Observable<EvaluationExpense[]> {
    return this.http.get<EvaluationExpense[]>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation/expenses`),
    );
  }

  createEvaluationExpense(
    vehicleId: string,
    payload: EvaluationExpenseRequest,
  ): Observable<EvaluationExpense> {
    return this.http.post<EvaluationExpense>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation/expenses`),
      payload,
    );
  }

  updateEvaluationExpense(
    vehicleId: string,
    expenseId: string,
    payload: Partial<EvaluationExpenseRequest>,
  ): Observable<EvaluationExpense> {
    return this.http.patch<EvaluationExpense>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation/expenses/${expenseId}`),
      payload,
    );
  }

  deleteEvaluationExpense(vehicleId: string, expenseId: string): Observable<void> {
    return this.http.delete<void>(
      buildApiUrl(this.apiUrl, `/vehicles/${vehicleId}/evaluation/expenses/${expenseId}`),
    );
  }
}
