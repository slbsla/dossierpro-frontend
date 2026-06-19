import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { EmSessionService } from '../../core/services/em-session.service';
import { Role } from '../../core/models/models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Input() title = 'DossierPro';
  Role = Role;
  role: Role | null = null;
  managerRoleName: string | null = null;

  constructor(
    private authService: AuthService,
    public emSession: EmSessionService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(u => {
      this.role = u?.role ?? null;
      this.managerRoleName = u?.roleName ?? null;
    });
  }

  /**
   * Seul un manager ayant le rôle "Entity Manager" peut gérer plusieurs entités
   * et donc changer d'entité. Les autres rôles (Entity Auditor, Entity Signataire)
   * ne travaillent qu'au sein d'une seule entité : le bouton est désactivé.
   */
  get canSwitchEntity(): boolean {
    return this.managerRoleName === 'Entity Manager';
  }

  changeEntity(): void {
    if (!this.canSwitchEntity) return;
    this.emSession.clear();
  }
}
