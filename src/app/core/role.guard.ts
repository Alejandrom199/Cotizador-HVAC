import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { SessionService } from './session.service';
import { canAccessPath } from './role-access';

export const roleChildGuard: CanActivateChildFn = (_child, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (canAccessPath(session.role(), state.url)) {
    return true;
  }
  return router.createUrlTree(['/inicio']);
};
