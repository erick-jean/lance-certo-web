import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { buildApiUrl, normalizeApiBaseUrl } from '../../../core/utils/api';
import {
  SubscriptionCheckoutRequest,
  SubscriptionCheckoutResponse,
} from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = normalizeApiBaseUrl(environment.apiUrl);

  createSubscription(cardTokenId: string): Observable<SubscriptionCheckoutResponse> {
    const body: SubscriptionCheckoutRequest = { cardTokenId };

    return this.http.post<SubscriptionCheckoutResponse>(
      buildApiUrl(this.apiUrl, '/subscriptions/checkout'),
      body,
    );
  }
}
