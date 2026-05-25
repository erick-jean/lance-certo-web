import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';

import { Auth } from '../services/auth';

export function initializeAuth() {
  const authService = inject(Auth);

  if (authService.getAccessToken()) {
    return of(null);
  }

  // If a valid httpOnly session cookie exists, the backend restores an access token before the first navigation.
  return authService.refreshToken().pipe(
    catchError(() => {
      authService.clearSession();
      return of(null);
    }),
  );
}
