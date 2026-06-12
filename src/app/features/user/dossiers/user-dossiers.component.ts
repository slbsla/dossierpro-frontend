import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Dossier, DossierStatus, DossierType, PageResponse } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

/** Construit le groupe de contrôles communs aux 3 modes (create / edit / duplicate). */
function buildFormControls(fb: FormBuilder, d?: Partial<Dossier>) {
  return {
    libelle:        [d?.libelle        ?? '', [Validators.required, Validators.maxLength(30)]],
    description:    [d?.description    ?? ''],
    type:           [d?.type           ?? '', Validators.required],
    amount:         [d?.amount         ?? 0, [Validators.required, Validators.min(0)]],
    motif:          [d?.motif          ?? '', Validators.maxLength(30)],
    budgetDepart:   [d?.budgetDepart   ?? null],
    nombrePart:     [d?.nombrePart     ?? null, [Validators.min(0), Validators.max(9), Validators.pattern('^[0-9]$')]],
    immatriculation:[d?.immatriculation ?? '', Validators.maxLength(10)],
  };
}

@Component({ selector: 'app-user-dossiers', templateUrl: './user-dossiers.component.html' })
export class UserDossiersComponent implements OnInit, OnDestroy {
  page: PageResponse<Dossier> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; exporting = false; showModal = false; editMode = false; duplicateMode = false; selectedRef: string | null = null;
  form!: FormGroup; error = ''; success = '';
  dossierTypes = Object.values(DossierType);
  DossierStatus = DossierStatus;
  viewDossier: Dossier | null = null;

  searchTerm = '';
  selectedType = '';
  originalValues: any = {};
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
  onTypeChange(type: string) { this.selectedType = type; this.load(0); }

  load(p = 0, search = this.searchTerm) {
    this.loading = true;
    this.api.getUserDossiers(p, 8, search, this.selectedType).subscribe({ next: r => { this.page = r; this.loading = false; }, error: () => this.loading = false });
  }

  openCreate() {
    this.editMode = false; this.duplicateMode = false; this.selectedRef = null;
    this.viewDossier = null; this.error = '';
    this.form = this.fb.group({ ...buildFormControls(this.fb), submitNow: [false] });
    this.showModal = true;
  }

  openDuplicate(d: Dossier) {
    this.editMode = false; this.duplicateMode = true; this.selectedRef = null;
    this.viewDossier = null; this.error = '';
    const base = { ...d, libelle: d.libelle.substring(0, 17) + '_cp' };
    this.form = this.fb.group({ ...buildFormControls(this.fb, base), submitNow: [false] });
    this.showModal = true;
  }

  openEdit(d: Dossier) {
    if (d.status === DossierStatus.VALIDATED || d.status === 'EXPIRED') return;
    this.editMode = true; this.duplicateMode = false; this.selectedRef = d.reference;
    this.viewDossier = d; this.error = '';
    this.originalValues = { libelle: d.libelle, description: d.description, type: d.type, amount: d.amount,
      motif: d.motif, budgetDepart: d.budgetDepart, nombrePart: d.nombrePart, immatriculation: d.immatriculation };
    this.form = this.fb.group(buildFormControls(this.fb, d));
    this.showModal = true;
  }

  resetForm() { this.form.patchValue(this.originalValues); this.error = ''; }

  formatDate(d?: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch { return d; }
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

  exportExcel() {
    this.exporting = true;
    this.api.exportUserDossiers(this.searchTerm, this.selectedType).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mes-dossiers-${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => { this.exporting = false; this.showError('Impossible de générer le fichier Excel.'); }
    });
  }

  private async showError(msg: string) {
    await this.confirm.open({ title: 'Erreur', message: msg, confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
  statusClass(s: string) { return 'badge-' + s.toLowerCase(); }
}
