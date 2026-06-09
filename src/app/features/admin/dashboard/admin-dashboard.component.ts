import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { DashboardAdmin } from '../../../core/models/models';

@Component({ selector: 'app-admin-dashboard', templateUrl: './admin-dashboard.component.html' })
export class AdminDashboardComponent implements OnInit {
  dashboard: DashboardAdmin | null = null;
  loading = true;

  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getAdminDashboard().subscribe({ next: d => { this.dashboard = d; this.loading = false; }, error: () => this.loading = false }); }

  getStatusEntries() {
    if (!this.dashboard) return [];
    return Object.entries(this.dashboard.dossiersByStatus);
  }
}
