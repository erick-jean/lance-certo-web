import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    provideAppInitializer(() => {
      const authService = inject(AuthService);

      return authService.refreshToken().pipe(
        catchError(() => {
          authService.clearSession();
          return of(null);
        })
      );
    })
  ]
};