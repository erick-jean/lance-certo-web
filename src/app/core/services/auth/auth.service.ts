import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, shareReplay, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { buildApiUrl, normalizeApiBaseUrl } from '../../utils/api';
import { RegisterRequest, RegisterResponse, AuthResponse, LoginRequest } from './auth.models';

const ACCESS_TOKEN_STORAGE_KEY = 'lance_certo_access_token';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = normalizeApiBaseUrl(environment.apiUrl);

  private readonly accessToken = signal<string | null>(this.getStoredAccessToken());
  private refreshInFlight$?: Observable<AuthResponse>;

  readonly isAuthenticated = computed(() => !!this.accessToken());

  login(data: LoginRequest) {
    return this.http
      .post<AuthResponse>(buildApiUrl(this.apiUrl, '/auth/login'), data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.setAccessToken(response.access_token);
        }),
      );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(buildApiUrl(this.apiUrl, '/auth/register'), payload);
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
            this.setAccessToken(response.access_token);
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
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  private setAccessToken(token: string): void {
    this.accessToken.set(token);
    sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  }

  private getStoredAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}
