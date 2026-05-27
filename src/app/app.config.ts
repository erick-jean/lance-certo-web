import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { initializeAuth } from './core/initializers/auth.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true })),

    provideHttpClient(withInterceptors([authInterceptor])),

    provideAppInitializer(initializeAuth),
  ],
};
