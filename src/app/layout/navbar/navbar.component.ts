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

  constructor(
    private authService: AuthService,
    public emSession: EmSessionService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(u => this.role = u?.role ?? null);
  }

  changeEntity(): void { this.emSession.clear(); }
}
