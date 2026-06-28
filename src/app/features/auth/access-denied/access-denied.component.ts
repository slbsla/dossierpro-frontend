import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent {
  // Portail client (dossierpro-web), servi par le même jar sous /dossier-web/.
  clientUrl = '/dossier-web/connexion';

  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
