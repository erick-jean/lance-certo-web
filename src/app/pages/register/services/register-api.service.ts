import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { buildApiUrl, normalizeApiBaseUrl } from '../../../core/utils/api';
import { RegisterRequest, RegisterResponse } from '../../../core/services/auth/auth.models';

@Injectable({ providedIn: 'root' })
export class RegisterApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = normalizeApiBaseUrl(environment.apiUrl);

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(buildApiUrl(this.apiUrl, '/auth/register'), payload);
  }
}
