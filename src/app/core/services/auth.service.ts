import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../../app/environments/environment';

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly accessToken = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.accessToken());

  login(data: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.accessToken.set(response.access_token);
        }),
      );
  }

  refreshToken() {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => {
          this.accessToken.set(response.access_token);
        }),
      );
  }

  logout() {
    return this.http
      .post(
        `${this.apiUrl}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.clearSession();
        }),
      );
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  clearSession(): void {
    this.accessToken.set(null);
  }
}
