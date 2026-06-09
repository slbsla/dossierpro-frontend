import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const roles: string[] = route.data['roles'] || [];
    if (roles.length === 0) return true;
    const user = this.auth.currentUser;
    if (user && roles.includes(user.role)) return true;
    this.router.navigate([this.auth.getHomeRoute()]);
    return false;
  }
}
