import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
  private readonly apiUrl = environment.apiUrl;

  getSummary() {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/summary`);
  }
}
