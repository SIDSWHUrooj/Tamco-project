import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { PortalStateService } from './portal-state.service';
import { AuthService } from './auth.service';
import { Role } from './models';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, stateSnapshot: RouterStateSnapshot) => {
  const state = inject(PortalStateService);
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Must be authenticated and token must not be expired
  if (!state.authenticated() || auth.isTokenExpired()) {
    auth.clearSession();
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: stateSnapshot.url } });
  }

  // 2. Enforce strict role isolation - prevent entering other portals
  const currentRole = state.role();
  const targetRole = (route.paramMap.get('role') as Role | null) || (route.routeConfig?.path === 'vendor' ? 'vendor' : null);

  if (targetRole && targetRole !== currentRole) {
    const homeRoute = currentRole === 'vendor' && state.vendorStatusCode() < 3 ? 'profile' : 'dashboard';
    return router.createUrlTree(['/', currentRole, homeRoute]);
  }

  // 3. Enforce 4-Tier Vendor Lifecycle Restrictions (Legacy .NET active 0, 1, 2 vs 3+)
  if (currentRole === 'vendor') {
    const statusCode = state.vendorStatusCode();
    if (statusCode < 3) {
      // Vendor has not been fully certified in Sage 300 ERP yet
      // Can ONLY access registration wizard / review / pending tracker (/vendor/profile)
      const cleanUrl = stateSnapshot.url.split('?')[0];
      if (cleanUrl !== '/vendor/profile') {
        const queryParams = statusCode === 1 ? { mode: 'review' } : (statusCode === 2 ? { mode: 'pending' } : {});
        return router.createUrlTree(['/vendor/profile'], { queryParams });
      }
    }
  }

  return true;
};
