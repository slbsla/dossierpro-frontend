import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { DashboardEm, ActivityLog } from '../../../core/models/models';

@Component({ selector: 'app-em-dashboard', templateUrl: './em-dashboard.component.html' })
export class EmDashboardComponent implements OnInit {
  dashboard: DashboardEm | null = null;
  recentLogs: ActivityLog[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getEmDashboard().subscribe({
      next: d => { this.dashboard = d; this.loading = false; },
      error: () => this.loading = false
    });
    this.api.getEmActivityLogs(0, 8).subscribe({
      next: (r: any) => this.recentLogs = r.content ?? [],
      error: () => {}
    });
  }

  actionLabel(action: string): string {
    const labels: Record<string, string> = {
      CREATE: 'Création', DELETE: 'Suppression', EDIT: 'Modification',
      SUBMIT: 'Soumission', VALIDATE: 'Validation', REJECT: 'Rejet',
      ACTIVATE: 'Activation', INACTIVATE: 'Désactivation', SAVE: 'Sauvegarde'
    };
    return labels[action] ?? action;
  }

  actionClass(action: string): string {
    const classes: Record<string, string> = {
      CREATE: 'badge-active', DELETE: 'badge-rejected', EDIT: 'badge-submit',
      VALIDATE: 'badge-validated', REJECT: 'badge-rejected', SUBMIT: 'badge-submit'
    };
    return classes[action] ?? 'badge-draft';
  }
}
