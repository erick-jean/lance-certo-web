import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../environments/environment';
import { buildApiUrl, normalizeApiBaseUrl } from '../utils/api';

export interface DashboardSummary {
  totalVehicles: number;
  analyzingVehicles: number;
  rejectedVehicles: number;
  purchasedVehicles: number;
  soldVehicles: number;
  plan: 'free' | 'premium';
  vehicleLimit: number;
  remainingVehicles: number;
}

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = normalizeApiBaseUrl(environment.apiUrl);

  getSummary() {
    return this.http.get<DashboardSummary>(buildApiUrl(this.apiUrl, '/dashboard/summary'));
  }
}
