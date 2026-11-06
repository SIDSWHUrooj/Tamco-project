import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Retrieve token from sessionStorage or localStorage
  let token: string | null = null;
  try {
    if (typeof window !== 'undefined') {
      const sToken = window.sessionStorage?.getItem('tamco_jwt_token');
      const lToken = window.localStorage?.getItem('tamco_jwt_token');
      token = (sToken && !sToken.startsWith('DEMO_TOKEN_')) ? sToken : ((lToken && !lToken.startsWith('DEMO_TOKEN_')) ? lToken : null);
    }
  } catch {
    token = null;
  }

  // 2. Check if request targets our backend API
  const isApiUrl = req.url.startsWith(environment.apiUrl) ||
                   req.url.startsWith('/api/') ||
                   req.url.includes('vportalapi.siddev.online');

  // 3. Attach Bearer token to all backend API requests
  let authReq = req;
  const cleanToken = token?.trim();
  if (cleanToken && cleanToken !== 'undefined' && cleanToken !== 'null' && isApiUrl) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${cleanToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/Account/')) {
        console.warn(`[HTTP 401 Unauthorized] API rejected request to ${req.url}. Token attached: ${!!cleanToken}`);
      }
      return throwError(() => error);
    })
  );
};
