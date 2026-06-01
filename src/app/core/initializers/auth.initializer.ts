import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';

import { Auth } from '../services/auth/auth.service';

export function initializeAuth() {
  const authService = inject(Auth);

  if (!authService.getAccessToken()) {
    return of(null);
  }

  return authService.refreshToken().pipe(
    catchError(() => {
      // On init failure (e.g. backend cold start, network error), keep the existing
      // token in sessionStorage — the interceptor handles 401s when requests are made.
      return of(null);
    }),
  );
}
