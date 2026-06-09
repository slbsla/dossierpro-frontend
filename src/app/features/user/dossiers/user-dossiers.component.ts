import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Dossier, DossierStatus, DossierType, PageResponse } from '../../../core/models/models';

@Component({ selector: 'app-user-dossiers', templateUrl: './user-dossiers.component.html' })
export class UserDossiersComponent implements OnInit {
  page: PageResponse<Dossier> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; showModal = false; editMode = false; selectedRef: string | null = null;
  form!: FormGroup; error = ''; success = '';
  dossierTypes = Object.values(DossierType);
  DossierStatus = DossierStatus;
  viewDossier: Dossier | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {}
  ngOnInit() { this.load(); }

  load(p = 0) {
    this.loading = true;
    this.api.getUserDossiers(p, 8).subscribe({ next: r => { this.page = r; this.loading = false; }, error: () => this.loading = false });
  }

  openCreate() {
    this.editMode = false; this.selectedRef = null; this.error = '';
    this.form = this.fb.group({ libelle: ['', Validators.required], description: [''], type: ['', Validators.required], amount: [0, [Validators.required, Validators.min(0)]], submitNow: [false] });
    this.showModal = true;
  }

  openEdit(d: Dossier) {
    if (d.status !== DossierStatus.DRAFT) return;
    this.editMode = true; this.selectedRef = d.reference; this.error = '';
    this.form = this.fb.group({ libelle: [d.libelle, Validators.required], description: [d.description], type: [d.type, Validators.required], amount: [d.amount, [Validators.required, Validators.min(0)]] });
    this.showModal = true;
  }

  save() {
    if (this.form.invalid) return;
    const obs = this.editMode ? this.api.updateDossier(this.selectedRef!, this.form.value) : this.api.createDossier(this.form.value);
    obs.subscribe({ next: () => { this.showModal = false; this.load(this.page.page); this.success = this.editMode ? 'Dossier modifié' : 'Dossier créé'; setTimeout(() => this.success = '', 3000); }, error: (e) => this.error = e?.error?.message || 'Erreur' });
  }

  submit(ref: string) {
    if (!confirm('Soumettre ce dossier au manager ?')) return;
    this.api.submitDossier(ref).subscribe({ next: () => { this.load(this.page.page); this.success = 'Dossier soumis'; setTimeout(() => this.success = '', 3000); }, error: (e) => alert(e?.error?.message || 'Erreur') });
  }

  delete(ref: string) {
    if (!confirm('Supprimer ce dossier ?')) return;
    this.api.deleteDossier(ref).subscribe({ next: () => { this.load(this.page.page); this.success = 'Dossier supprimé'; setTimeout(() => this.success = '', 3000); }, error: (e) => alert(e?.error?.message || 'Erreur') });
  }

  downloadPdf(ref: string) {
    this.api.downloadUserPdf(ref).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dossier-${ref}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => alert('PDF non disponible pour ce dossier.')
    });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
  statusClass(s: string) { return 'badge-' + s.toLowerCase(); }
}
