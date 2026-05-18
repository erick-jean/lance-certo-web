// src/app/core/interceptors/auth.interceptor.ts

import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  const token = authService.getAccessToken();

  const isAuthRoute =
    request.url.includes('/auth/login') ||
    request.url.includes('/auth/refresh') ||
    request.url.includes('/auth/logout');

  const authRequest = request.clone({
    withCredentials: true,
    setHeaders: token && !isAuthRoute
      ? {
          Authorization: `Bearer ${token}`
        }
      : {}
  });

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthRoute) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap(() => {
          const newToken = authService.getAccessToken();

          const retryRequest = request.clone({
            withCredentials: true,
            setHeaders: newToken
              ? {
                  Authorization: `Bearer ${newToken}`
                }
              : {}
          });

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          authService.clearSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};