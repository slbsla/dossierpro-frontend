import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Dossier, DossierStatus, PageResponse } from '../../../core/models/models';

@Component({ selector: 'app-em-dossiers', templateUrl: './em-dossiers.component.html', styleUrls: ['./em-dossiers.component.css'] })
export class EmDossiersComponent implements OnInit {
  activeTab: 'pending' | 'validated' = 'pending';
  pendingPage: PageResponse<Dossier> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  validatedPage: PageResponse<Dossier> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false;

  // Validation workflow
  selectedDossier: Dossier | null = null;
  workflowStep = 0; // 0=none, 1=review, 2=generate, 3=sign
  rejectMode = false; rejectMotif = '';
  workflowLoading = false; workflowError = '';
  DossierStatus = DossierStatus;

  constructor(private api: ApiService) {}
  ngOnInit() { this.loadPending(); this.loadValidated(); }

  loadPending(p = 0) {
    this.loading = true;
    this.api.getPendingDossiers(p, 8).subscribe({ next: r => { this.pendingPage = r; this.loading = false; }, error: () => this.loading = false });
  }

  loadValidated(p = 0) {
    this.api.getValidatedDossiers(p, 8).subscribe({ next: r => this.validatedPage = r });
  }

  openValidation(d: Dossier) {
    this.selectedDossier = d; this.workflowStep = 1;
    this.rejectMode = false; this.rejectMotif = ''; this.workflowError = '';
  }

  closeWorkflow() { this.selectedDossier = null; this.workflowStep = 0; this.workflowLoading = false; this.workflowError = ''; }

  reject() {
    if (!this.rejectMotif.trim()) { this.workflowError = 'Le motif de rejet est obligatoire'; return; }
    this.workflowLoading = true;
    this.api.rejectDossier(this.selectedDossier!.reference, this.rejectMotif).subscribe({
      next: () => { this.closeWorkflow(); this.loadPending(); this.loadValidated(); },
      error: (e) => { this.workflowError = e?.error?.message || 'Erreur'; this.workflowLoading = false; }
    });
  }

  generatePdf() {
    this.workflowLoading = true; this.workflowError = '';
    this.api.generatePdf(this.selectedDossier!.reference).subscribe({
      next: () => { this.workflowStep = 3; this.workflowLoading = false; },
      error: (e) => { this.workflowError = 'Erreur génération PDF'; this.workflowLoading = false; }
    });
  }

  signAndValidate() {
    this.workflowLoading = true; this.workflowError = '';
    this.api.signDossier(this.selectedDossier!.reference).subscribe({
      next: () => { this.closeWorkflow(); this.loadPending(); this.loadValidated(); },
      error: (e) => { this.workflowError = e?.error?.message || 'Erreur'; this.workflowLoading = false; }
    });
  }

  pages(p: PageResponse<any>) { return Array.from({ length: p.totalPages }, (_, i) => i); }
  statusClass(s: string) { return 'badge-' + s.toLowerCase(); }
}
