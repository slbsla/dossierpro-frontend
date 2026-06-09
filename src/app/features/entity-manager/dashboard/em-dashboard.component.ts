import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { DashboardEm } from '../../../core/models/models';

@Component({ selector: 'app-em-dashboard', templateUrl: './em-dashboard.component.html' })
export class EmDashboardComponent implements OnInit {
  dashboard: DashboardEm | null = null; loading = true;
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getEmDashboard().subscribe({ next: d => { this.dashboard = d; this.loading = false; }, error: () => this.loading = false }); }
  statusEntries() { return this.dashboard ? Object.entries(this.dashboard.dossiersByStatus) : []; }
}
