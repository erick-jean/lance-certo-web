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
      authService.clearSession();
      return of(null);
    }),
  );
}
