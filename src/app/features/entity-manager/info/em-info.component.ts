import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { UserInfo, DashboardEm } from '../../../core/models/models';

@Component({ selector: 'app-em-info', templateUrl: './em-info.component.html' })
export class EmInfoComponent implements OnInit {
  user: UserInfo | null = null;
  dashboard: DashboardEm | null = null;

  constructor(private auth: AuthService, private api: ApiService) {}
  ngOnInit() {
    this.user = this.auth.currentUser;
    this.api.getEmDashboard().subscribe(d => this.dashboard = d);
  }
}
