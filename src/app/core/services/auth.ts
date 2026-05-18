import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, shareReplay, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { buildApiUrl, normalizeApiBaseUrl } from '../utils/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = normalizeApiBaseUrl(environment.apiUrl);

  // The access token stays in memory only; refresh depends on the backend httpOnly cookie.
  private readonly accessToken = signal<string | null>(null);
  private refreshInFlight$?: Observable<AuthResponse>;

  readonly isAuthenticated = computed(() => !!this.accessToken());

  login(data: LoginRequest) {
    return this.http
      .post<AuthResponse>(buildApiUrl(this.apiUrl, '/auth/login'), data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.accessToken.set(response.access_token);
        }),
      );
  }

  refreshToken() {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<AuthResponse>(
          buildApiUrl(this.apiUrl, '/auth/refresh'),
          {},
          {
            withCredentials: true,
          },
        )
        .pipe(
          tap((response) => {
            this.accessToken.set(response.access_token);
          }),
          finalize(() => {
            this.refreshInFlight$ = undefined;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }

    return this.refreshInFlight$;
  }

  logout() {
    return this.http
      .post(
        buildApiUrl(this.apiUrl, '/auth/logout'),
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          // The backend invalidates the session; the client clears the in-memory token too.
          this.clearSession();
        }),
        finalize(() => {
          this.clearSession();
        }),
      );
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  clearSession(): void {
    this.accessToken.set(null);
    this.refreshInFlight$ = undefined;
  }
}
