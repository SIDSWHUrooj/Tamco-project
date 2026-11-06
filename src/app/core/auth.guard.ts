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

  // 2. Enforce role & security group access
  const user = state.currentUser();
  const sg = (user?.securityGroup || '').trim();
  const isMaster = (sg === '1' || sg === '4') || (sg !== '2' && sg !== '3' && user?.role === 'admin');

  const currentRole = state.role();
  const targetRole = (route.paramMap.get('role') as Role | null) || (route.routeConfig?.path === 'vendor' ? 'vendor' : null);

  if (isMaster) {
    // Admin / Manager has master privileges across all portals
    if (targetRole && targetRole !== currentRole) {
      state.setRole(targetRole);
    }
  } else {
    // Non-master users (Editor, Viewer, Vendor): strictly confined to their authorized portal
    let allowedPortal: Role = 'vendor';
    if (sg === '2' || user?.role === 'procurement') {
      allowedPortal = 'procurement';
    } else if (sg === '3' || user?.role === 'finance') {
      allowedPortal = 'finance';
    }

    if (targetRole && targetRole !== allowedPortal) {
      state.setRole(allowedPortal);
      return router.createUrlTree(['/', allowedPortal, 'dashboard']);
    }
  }

  // 3. Enforce 3-Stage Vendor Lifecycle Restrictions (0: Draft Wizard, 1-2: Under Review, 3+: Approved Partner)
  const activeRole = targetRole || currentRole;
  if (activeRole === 'vendor') {
    const statusCode = state.vendorStatusCode();
    if (statusCode < 3) {
      // Vendor has not been fully certified in Sage 300 ERP yet
      // Can ONLY access registration wizard / review status tracker (/vendor/profile)
      const cleanUrl = stateSnapshot.url.split('?')[0];
      if (cleanUrl !== '/vendor/profile') {
        const queryParams = statusCode >= 1 ? { mode: 'review' } : { mode: 'draft' };
        return router.createUrlTree(['/vendor/profile'], { queryParams });
      }
    }
  }

  return true;
};
