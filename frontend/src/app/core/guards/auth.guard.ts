import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkAccess(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkAccess(childRoute);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isLoggedIn) return this.router.createUrlTree(['/auth/login']);

    const allowedRoles = route.data['roles'] as UserRole[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) return true;

    if (this.auth.hasAnyRole(allowedRoles)) return true;
    return this.router.createUrlTree([this.auth.getDefaultRoute()]);
  }
}
