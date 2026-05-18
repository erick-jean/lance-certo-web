import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const AUTH_STORAGE_KEY = 'lance-certo-authenticated';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly authenticated = signal(this.readStoredAuthState());

  readonly isAuthenticated = this.authenticated.asReadonly();

  login(): void {
    this.writeStoredAuthState(true);
    this.authenticated.set(true);
  }

  logout(): void {
    this.writeStoredAuthState(false);
    this.authenticated.set(false);
  }

  private readStoredAuthState(): boolean {
    if (!this.isBrowser) return false;

    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private writeStoredAuthState(isAuthenticated: boolean): void {
    if (!this.isBrowser) return;

    try {
      if (isAuthenticated) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        return;
      }

      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      this.authenticated.set(false);
    }
  }
}
