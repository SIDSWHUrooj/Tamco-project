import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Retrieve token from sessionStorage
  let token: string | null = null;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      token = sessionStorage.getItem('tamco_jwt_token');
    }
  } catch {
    token = null;
  }

  // Check if request is directed to our backend API
  const isApiUrl = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api/');

  // Check if current session is an offline/demo session
  const isDemo = !token || token.includes('DEMO_TOKEN') || false;

  // Proactively check token expiration before sending (real backend JWT tokens only)
  if (token && !isDemo) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          sessionStorage.removeItem('tamco_jwt_token');
          sessionStorage.removeItem('tamco_refresh_token');
          sessionStorage.removeItem('tamco_portal_auth');
          router.navigate(['/login']);
          return throwError(() => new Error('Session expired. Please sign in again.'));
        }
      }
    } catch {}
  }

  let authReq = req;
  if (token && isApiUrl && !isDemo) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If server returns 401 Unauthorized for real backend sessions
      if (error.status === 401 && !req.url.includes('/api/Account/')) {
        const activeToken = sessionStorage.getItem('tamco_jwt_token');
        const activeDemo = !activeToken || activeToken.includes('DEMO_TOKEN');
        if (!activeDemo) {
          try {
            sessionStorage.removeItem('tamco_jwt_token');
            sessionStorage.removeItem('tamco_refresh_token');
            sessionStorage.removeItem('tamco_portal_auth');
          } catch {}
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
