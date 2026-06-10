import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { EntityUser, PageResponse } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

@Component({ selector: 'app-em-users', templateUrl: './em-users.component.html', styleUrls: ['./em-users.component.css'] })
export class EmUsersComponent implements OnInit {
  page: PageResponse<EntityUser> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; showModal = false; editMode = false; selectedRef: string | null = null;
  form!: FormGroup; error = ''; success = '';
  showPassword = false; showConfirmPassword = false;
  originalValues: any = {};

  constructor(private api: ApiService, private fb: FormBuilder, private confirm: ConfirmDialogService) {}
  ngOnInit() { this.load(); }

  load(p = 0) {
    this.loading = true;
    this.api.getEmUsers(p, 8).subscribe({ next: r => { this.page = r; this.loading = false; }, error: () => this.loading = false });
  }

  openCreate() {
    this.editMode = false; this.selectedRef = null; this.error = '';
    this.showPassword = false; this.showConfirmPassword = false;
    this.form = this.fb.group({
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      telephone:       [''],
      email:           ['', Validators.email],
      password:        ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    });
    this.showModal = true;
  }

  openEdit(u: EntityUser) {
    this.editMode = true; this.selectedRef = u.reference; this.error = '';
    this.originalValues = { firstName: u.firstName, lastName: u.lastName, telephone: u.telephone, email: u.email };
    this.form = this.fb.group({
      firstName: [u.firstName, Validators.required],
      lastName:  [u.lastName,  Validators.required],
      telephone: [u.telephone],
      email:     [u.email, Validators.email]
    });
    this.showModal = true;
  }

  resetForm() { this.form.patchValue(this.originalValues); this.error = ''; }

  save() {
    if (this.form.invalid) return;
    if (!this.editMode && this.form.value.password !== this.form.value.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.'; return;
    }
    const { confirmPassword, ...payload } = this.form.value;
    const obs = this.editMode ? this.api.updateEmUser(this.selectedRef!, payload) : this.api.createEmUser(payload);
    obs.subscribe({
      next: () => { this.showModal = false; this.load(this.page.page); this.success = this.editMode ? 'Utilisateur modifié avec succès.' : 'Utilisateur créé avec succès.'; setTimeout(() => this.success = '', 5000); },
      error: (e) => this.error = e?.error?.message || 'Erreur'
    });
  }

  async delete(ref: string) {
    const ok = await this.confirm.open({
      title: 'Supprimer l\'utilisateur',
      message: 'L\'utilisateur et tous ses dossiers seront supprimés définitivement.',
      confirmLabel: 'Supprimer',
      type: 'danger'
    });
    if (!ok) return;
    this.api.deleteEmUser(ref).subscribe({
      next: () => { this.load(this.page.page); this.success = 'Utilisateur supprimé'; setTimeout(() => this.success = '', 3000); },
      error: (e) => this.confirm.open({ title: 'Erreur', message: e?.error?.message || 'Erreur', confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' })
    });
  }

  async toggleActive(ref: string) {
    this.api.toggleUserActive(ref).subscribe({
      next: () => this.load(this.page.page),
      error: (e) => this.confirm.open({ title: 'Erreur', message: e?.error?.message || 'Erreur', confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' })
    });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
}
