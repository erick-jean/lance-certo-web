import { Auth } from '../services/auth';
import { catchError, of } from 'rxjs';

export function initializeAuth(authService: Auth) {
  return () => {
    return authService.refreshToken().pipe(
      catchError(() => {
        authService.clearSession();
        return of(null);
      }),
    );
  };
}
