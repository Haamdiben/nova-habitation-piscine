import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * When an authenticated admin request is rejected with 401 (token expired or
 * invalid), log out and send the admin back to the login page.
 */
export const authExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        req.headers.has('Authorization')
      ) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
