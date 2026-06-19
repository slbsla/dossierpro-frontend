import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Dossier, DossierArchive, DossierStatus, PageResponse } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-em-dossiers', templateUrl: './em-dossiers.component.html', styleUrls: ['./em-dossiers.component.css'] })
export class EmDossiersComponent implements OnInit {
  activeTab: 'pending' | 'validated' | 'archived' = 'pending';
  pendingPage: PageResponse<Dossier> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  validatedPage: PageResponse<Dossier> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  archivedPage: PageResponse<DossierArchive> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; loadingValidated = false; loadingArchived = false;
  searchPending = ''; searchValidated = ''; statusFilter = '';

  // Validation workflow
  selectedDossier: Dossier | null = null;
  workflowStep = 0; // 0=none, 1=review, 2=generate, 3=sign
  rejectMode = false; rejectMotif = '';
  workflowLoading = false; workflowError = '';
  DossierStatus = DossierStatus;

  // Archive hash modal
  showHashModal = false;
  hashValue = '';
  hashLibelle = '';
  hashCopied = false;

  constructor(private api: ApiService, private confirm: ConfirmDialogService, private route: ActivatedRoute, private auth: AuthService) {}

  /** Entity Auditor : lecture seule, ne peut pas valider/rejeter/archiver. Entity Manager + Entity Signataire : oui. */
  get canProcessDossiers(): boolean { return this.auth.canProcessDossiers; }
  ngOnInit() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'pending') this.activeTab = 'pending';
    else if (tab === 'validated' || tab === 'rejected') this.activeTab = 'validated';
    else if (tab === 'archived') this.activeTab = 'archived';
    this.loadPending(); this.loadValidated(); this.loadArchived();
  }

  loadPending(p = 0) {
    this.loading = true;
    this.api.getPendingDossiers(p, 8, this.searchPending)
      .subscribe({ next: r => { this.pendingPage = r; this.loading = false; }, error: () => this.loading = false });
  }

  loadValidated(p = 0) {
    this.loadingValidated = true;
    this.api.getValidatedDossiers(p, 8, this.searchValidated, this.statusFilter)
      .subscribe({ next: r => { this.validatedPage = r; this.loadingValidated = false; }, error: () => this.loadingValidated = false });
  }

  loadArchived(p = 0) {
    this.loadingArchived = true;
    this.api.getArchives(p, 8)
      .subscribe({ next: r => { this.archivedPage = r; this.loadingArchived = false; }, error: () => this.loadingArchived = false });
  }

  onSearchPending(v: string)   { this.searchPending = v;   this.loadPending(0); }
  onSearchValidated(v: string) { this.searchValidated = v; this.loadValidated(0); }
  onStatusFilter(v: string)    { this.statusFilter = v;    this.loadValidated(0); }

  async archiveDossier(d: Dossier) {
    if (!this.canProcessDossiers) return;
    const ok = await this.confirm.open({
      title: 'Archiver le dossier',
      message: `Archiver le dossier <strong>${d.libelle}</strong> (<code>${d.reference}</code>) ? Cette action crée une archive et est irréversible.`,
      confirmLabel: 'Archiver', type: 'warning'
    });
    if (!ok) return;
    this.api.archiveDossier(d.reference).subscribe({
      next: () => { this.loadValidated(); this.loadArchived(); },
      error: (e) => this.confirm.open({ title: 'Erreur', message: e?.error?.message || 'Erreur lors de l\'archivage', confirmLabel: 'OK', cancelLabel: ' ', type: 'danger' })
    });
  }

  openHash(a: DossierArchive) {
    this.hashValue = a.hash;
    this.hashLibelle = a.libelle || a.referenceDossier;
    this.hashCopied = false;
    this.showHashModal = true;
  }

  copyHash() {
    navigator.clipboard.writeText(this.hashValue).then(() => {
      this.hashCopied = true;
      setTimeout(() => this.hashCopied = false, 2000);
    });
  }

  openValidation(d: Dossier) {
    if (!this.canProcessDossiers) return;
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

  downloadPdf(ref: string) {
    this.api.downloadEmPdf(ref).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dossier-${ref}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.confirm.open({ title: 'PDF indisponible', message: 'Le PDF n\'est pas disponible pour ce dossier.', confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' })
    });
  }

  pages(p: PageResponse<any>) { return Array.from({ length: p.totalPages }, (_, i) => i); }
  statusClass(s: string) { return 'badge-' + s.toLowerCase(); }
}
