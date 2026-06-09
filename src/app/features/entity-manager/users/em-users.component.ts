import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { EntityUser, PageResponse } from '../../../core/models/models';

@Component({ selector: 'app-em-users', templateUrl: './em-users.component.html' })
export class EmUsersComponent implements OnInit {
  page: PageResponse<EntityUser> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; showModal = false; editMode = false; selectedRef: string | null = null;
  form!: FormGroup; error = ''; success = '';

  constructor(private api: ApiService, private fb: FormBuilder) {}
  ngOnInit() { this.load(); }

  load(p = 0) {
    this.loading = true;
    this.api.getEmUsers(p, 8).subscribe({ next: r => { this.page = r; this.loading = false; }, error: () => this.loading = false });
  }

  openCreate() {
    this.editMode = false; this.selectedRef = null; this.error = '';
    this.form = this.fb.group({ firstName: ['', Validators.required], lastName: ['', Validators.required], telephone: [''], email: ['', Validators.email] });
    this.showModal = true;
  }

  openEdit(u: EntityUser) {
    this.editMode = true; this.selectedRef = u.reference; this.error = '';
    this.form = this.fb.group({ firstName: [u.firstName, Validators.required], lastName: [u.lastName, Validators.required], telephone: [u.telephone], email: [u.email, Validators.email] });
    this.showModal = true;
  }

  save() {
    if (this.form.invalid) return;
    const obs = this.editMode ? this.api.updateEmUser(this.selectedRef!, this.form.value) : this.api.createEmUser(this.form.value);
    obs.subscribe({ next: () => { this.showModal = false; this.load(this.page.page); this.success = this.editMode ? 'Utilisateur modifié' : 'Utilisateur créé (mdp: 00000)'; setTimeout(() => this.success = '', 5000); }, error: (e) => this.error = e?.error?.message || 'Erreur' });
  }

  delete(ref: string) {
    if (!confirm('Supprimer cet utilisateur et tous ses dossiers ?')) return;
    this.api.deleteEmUser(ref).subscribe({ next: () => { this.load(this.page.page); this.success = 'Utilisateur supprimé'; setTimeout(() => this.success = '', 3000); }, error: (e) => alert(e?.error?.message || 'Erreur') });
  }

  toggleActive(ref: string) {
    this.api.toggleUserActive(ref).subscribe({ next: () => this.load(this.page.page), error: (e) => alert(e?.error?.message || 'Erreur') });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
}
