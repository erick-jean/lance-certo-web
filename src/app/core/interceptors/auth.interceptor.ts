import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Auth } from '../services/auth/auth.service';
import { isApiRequest, isAuthEndpoint } from '../utils/api';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(Auth);
  const apiUrl = environment.apiUrl;

  const token = auth.getAccessToken();
  const matchesApi = isApiRequest(request.url, apiUrl);
  const isAuthRoute = isAuthEndpoint(request.url, apiUrl);

  const authRequest = request.clone({
    withCredentials: matchesApi,
    setHeaders:
      token && matchesApi && !isAuthRoute
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
  });

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthRoute || !matchesApi) {
        return throwError(() => error);
      }

      // Refresh only after a 401 from the API itself, and reuse the same in-flight refresh call.
      return auth.refreshToken().pipe(
        switchMap(() => {
          const newToken = auth.getAccessToken();

          const retryRequest = request.clone({
            withCredentials: true,
            setHeaders: newToken
              ? {
                  Authorization: `Bearer ${newToken}`,
                }
              : {},
          });

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          auth.clearSession();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
