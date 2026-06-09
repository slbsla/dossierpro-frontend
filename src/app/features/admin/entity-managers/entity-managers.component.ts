import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { EntityMng, PageResponse } from '../../../core/models/models';

@Component({ selector: 'app-entity-managers', templateUrl: './entity-managers.component.html', styleUrls: ['./entity-managers.component.css'] })
export class EntityManagersComponent implements OnInit {
  page: PageResponse<EntityMng> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; showModal = false; editMode = false; selectedRef: string | null = null;
  form!: FormGroup; error = ''; success = '';
  showPassword = false; showConfirmPassword = false;

  constructor(private api: ApiService, private fb: FormBuilder) {}
  ngOnInit() { this.load(); }

  load(p = 0) {
    this.loading = true;
    this.api.getEntityManagers(p, 8).subscribe({ next: r => { this.page = r; this.loading = false; }, error: () => this.loading = false });
  }

  openCreate() {
    this.editMode = false; this.selectedRef = null; this.error = '';
    this.showPassword = false; this.showConfirmPassword = false;
    this.form = this.fb.group({
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      telephone:       [''],
      fonction:        [''],
      password:        ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    });
    this.showModal = true;
  }

  openEdit(m: EntityMng) {
    this.editMode = true; this.selectedRef = m.reference; this.error = '';
    // Pas de champ mot de passe en édition
    this.form = this.fb.group({
      firstName: [m.firstName, Validators.required],
      lastName:  [m.lastName,  Validators.required],
      telephone: [m.telephone],
      fonction:  [m.fonction]
    });
    this.showModal = true;
  }

  save() {
    if (this.form.invalid) return;

    // Validation confirmation mot de passe (création uniquement)
    if (!this.editMode) {
      if (this.form.value.password !== this.form.value.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas.';
        return;
      }
    }

    // On n'envoie pas confirmPassword au backend
    const { confirmPassword, ...payload } = this.form.value;
    const obs = this.editMode
      ? this.api.updateEntityManager(this.selectedRef!, payload)
      : this.api.createEntityManager(payload);

    obs.subscribe({
      next: () => {
        this.showModal = false;
        this.load(this.page.page);
        this.success = this.editMode ? 'Entity Manager modifié avec succès.' : 'Entity Manager créé avec succès.';
        setTimeout(() => this.success = '', 5000);
      },
      error: (e) => this.error = e?.error?.message || 'Une erreur est survenue.'
    });
  }

  delete(ref: string) {
    if (!confirm('Confirmer la suppression de cet Entity Manager ?')) return;
    this.api.deleteEntityManager(ref).subscribe({
      next: () => { this.load(this.page.page); this.success = 'EM supprimé'; setTimeout(() => this.success = '', 3000); },
      error: (e) => alert(e?.error?.message || 'Erreur lors de la suppression')
    });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
}
