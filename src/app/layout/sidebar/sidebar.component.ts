import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Role, UserInfo } from '../../core/models/models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  user: UserInfo | null = null;
  Role = Role;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(u => this.user = u);
  }

  logout() { this.authService.logout(); }
}
