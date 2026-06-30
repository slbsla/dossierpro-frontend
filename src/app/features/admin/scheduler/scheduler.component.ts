import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { PageResponse, SchedulerExecution, SchedulerJob, SchedulerJobType, SchedulerStatus, TriggeredBy } from '../../../core/models/models';

@Component({ selector: 'app-scheduler', templateUrl: './scheduler.component.html', styleUrls: ['./scheduler.component.css'] })
export class SchedulerComponent implements OnInit {
  activeTab: 'history' | 'jobs' = 'history';

  page: PageResponse<SchedulerExecution> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true };
  loadingHistory = false;

  jobs: SchedulerJob[] = [];
  loadingJobs = false;
  triggering: Record<string, boolean> = {};

  error = '';
  success = '';

  SchedulerStatus = SchedulerStatus;
  TriggeredBy = TriggeredBy;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadHistory();
    this.loadJobs();
  }

  loadHistory(p = 0) {
    this.loadingHistory = true;
    this.api.getSchedulerExecutions(p, 10).subscribe({
      next: r => { this.page = r; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }

  loadJobs() {
    this.loadingJobs = true;
    this.api.getSchedulerJobs().subscribe({
      next: r => { this.jobs = r; this.loadingJobs = false; },
      error: () => { this.loadingJobs = false; }
    });
  }

  triggerJob(job: SchedulerJob) {
    if (this.triggering[job.jobType]) return;
    this.triggering[job.jobType] = true;
    this.error = ''; this.success = '';
    this.api.triggerSchedulerJob(job.jobType).subscribe({
      next: () => {
        this.triggering[job.jobType] = false;
        this.success = `Job "${job.label}" exécuté avec succès.`;
        setTimeout(() => this.success = '', 3000);
        this.loadJobs();
        if (this.activeTab === 'history') this.loadHistory(0);
      },
      error: () => {
        this.triggering[job.jobType] = false;
        this.error = `Échec du déclenchement de "${job.label}".`;
        setTimeout(() => this.error = '', 4000);
      }
    });
  }

  isTriggering(job: SchedulerJob): boolean {
    return !!this.triggering[job.jobType];
  }

  timeSince(dateStr?: string): string {
    if (!dateStr) return 'Jamais exécuté';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return 'À l\'instant';
    if (min < 60) return `Il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Il y a ${h} h ${min % 60} min`;
    const d = Math.floor(h / 24);
    return `Il y a ${d} j ${h % 24} h`;
  }
}
