import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PortalStateService } from './portal-state.service';

export const authGuard: CanActivateFn = () => {
  const state = inject(PortalStateService);
  return state.authenticated() || inject(Router).createUrlTree(['/login']);
};
