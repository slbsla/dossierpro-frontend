import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Dossier, DossierStatus, DossierType, PageResponse } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

@Component({ selector: 'app-user-dossiers', templateUrl: './user-dossiers.component.html' })
export class UserDossiersComponent implements OnInit, OnDestroy {
  page: PageResponse<Dossier> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; showModal = false; editMode = false; selectedRef: string | null = null;
  form!: FormGroup; error = ''; success = '';
  dossierTypes = Object.values(DossierType);
  DossierStatus = DossierStatus;
  viewDossier: Dossier | null = null;

  searchTerm = '';
  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService, private fb: FormBuilder, private confirm: ConfirmDialogService) {}

  ngOnInit() {
    this.search$.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => this.load(0, term));
    this.load();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  onSearch(term: string) { this.searchTerm = term; this.search$.next(term); }

  load(p = 0, search = this.searchTerm) {
    this.loading = true;
    this.api.getUserDossiers(p, 8, search).subscribe({ next: r => { this.page = r; this.loading = false; }, error: () => this.loading = false });
  }

  openCreate() {
    this.editMode = false; this.selectedRef = null; this.error = '';
    this.form = this.fb.group({ libelle: ['', Validators.required], description: [''], type: ['', Validators.required], amount: [0, [Validators.required, Validators.min(0)]], submitNow: [false] });
    this.showModal = true;
  }

  openEdit(d: Dossier) {
    if (d.status === DossierStatus.VALIDATED) return;
    this.editMode = true; this.selectedRef = d.reference; this.error = '';
    this.form = this.fb.group({ libelle: [d.libelle, Validators.required], description: [d.description], type: [d.type, Validators.required], amount: [d.amount, [Validators.required, Validators.min(0)]] });
    this.showModal = true;
  }

  save() {
    if (this.form.invalid) return;
    const obs = this.editMode ? this.api.updateDossier(this.selectedRef!, this.form.value) : this.api.createDossier(this.form.value);
    obs.subscribe({ next: () => { this.showModal = false; this.load(this.page.page, this.searchTerm); this.success = this.editMode ? 'Dossier modifié' : 'Dossier créé'; setTimeout(() => this.success = '', 3000); }, error: (e) => this.error = e?.error?.message || 'Erreur' });
  }

  async submit(ref: string) {
    const ok = await this.confirm.open({
      title: 'Soumettre le dossier',
      message: 'Ce dossier sera envoyé à votre manager pour validation. Continuer ?',
      confirmLabel: 'Soumettre',
      type: 'info'
    });
    if (!ok) return;
    this.api.submitDossier(ref).subscribe({
      next: () => { this.load(this.page.page); this.success = 'Dossier soumis'; setTimeout(() => this.success = '', 3000); },
      error: (e) => this.showError(e?.error?.message || 'Erreur lors de la soumission')
    });
  }

  async delete(ref: string) {
    const ok = await this.confirm.open({
      title: 'Supprimer le dossier',
      message: 'Cette action est irréversible. Le dossier sera définitivement supprimé.',
      confirmLabel: 'Supprimer',
      type: 'danger'
    });
    if (!ok) return;
    this.api.deleteDossier(ref).subscribe({
      next: () => { this.load(this.page.page); this.success = 'Dossier supprimé'; setTimeout(() => this.success = '', 3000); },
      error: (e) => this.showError(e?.error?.message || 'Erreur lors de la suppression')
    });
  }

  downloadPdf(ref: string) {
    this.api.downloadUserPdf(ref).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `dossier-${ref}.pdf`;
        a.click(); URL.revokeObjectURL(url);
      },
      error: () => this.showError('PDF non disponible pour ce dossier.')
    });
  }

  private async showError(msg: string) {
    await this.confirm.open({ title: 'Erreur', message: msg, confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
  statusClass(s: string) { return 'badge-' + s.toLowerCase(); }
}
