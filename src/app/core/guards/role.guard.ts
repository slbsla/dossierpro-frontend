import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.auth.currentUser;

    // Les profils USER (clients) disposent de leur propre portail (dossierpro-web) :
    // ce portail back-office leur reste interdit, quelle que soit la route demandée.
    if (user?.role === Role.USER) {
      this.router.navigate(['/acces-reserve']);
      return false;
    }

    const roles: string[] = route.data['roles'] || [];
    if (roles.length === 0) return true;
    if (user && roles.includes(user.role)) return true;
    this.router.navigate([this.auth.getHomeRoute()]);
    return false;
  }
}
