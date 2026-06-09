import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    // Si première connexion et pas déjà sur la page change-password → forcer la redirection
    if (this.auth.currentUser?.isFirstConnexion && !state.url.startsWith('/change-password')) {
      this.router.navigate(['/change-password']);
      return false;
    }
    return true;
  }
}
