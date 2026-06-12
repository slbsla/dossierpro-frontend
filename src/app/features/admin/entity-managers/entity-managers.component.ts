import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { EntityMng, PageResponse } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

@Component({ selector: 'app-entity-managers', templateUrl: './entity-managers.component.html', styleUrls: ['./entity-managers.component.css'] })
export class EntityManagersComponent implements OnInit {
  page: PageResponse<EntityMng> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  loading = false; showModal = false; editMode = false; selectedRef: string | null = null;
  form!: FormGroup; error = ''; success = '';
  showPassword = false; showConfirmPassword = false;
  originalValues: any = {};

  constructor(private api: ApiService, private fb: FormBuilder, private confirm: ConfirmDialogService) {}
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
    this.originalValues = { firstName: m.firstName, lastName: m.lastName, telephone: m.telephone, fonction: m.fonction };
    this.form = this.fb.group({
      firstName: [m.firstName, Validators.required],
      lastName:  [m.lastName,  Validators.required],
      telephone: [m.telephone],
      fonction:  [m.fonction]
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
    const obs = this.editMode ? this.api.updateEntityManager(this.selectedRef!, payload) : this.api.createEntityManager(payload);
    obs.subscribe({
      next: () => { this.showModal = false; this.load(this.page.page); this.success = this.editMode ? 'Entity Manager modifié avec succès.' : 'Entity Manager créé avec succès.'; setTimeout(() => this.success = '', 5000); },
      error: (e) => this.error = e?.error?.message || 'Une erreur est survenue.'
    });
  }

  async delete(m: EntityMng) {
    if (m.entityCode) {
      await this.confirm.open({
        title: 'Suppression impossible',
        message: `Ce manager est actuellement affecté à l'entité "${m.entityName || m.entityCode}". Veuillez d'abord lui retirer l'entité avant de le supprimer.`,
        confirmLabel: 'OK',
        cancelLabel: ' ',
        type: 'warning'
      });
      return;
    }
    const ok = await this.confirm.open({
      title: 'Supprimer l\'Entity Manager',
      message: 'Ce manager n\'est pas attaché à une entité. Voulez-vous le supprimer définitivement ?',
      confirmLabel: 'Supprimer',
      type: 'danger'
    });
    if (!ok) return;
    this.api.deleteEntityManager(m.reference).subscribe({
      next: () => { this.load(this.page.page); this.success = 'EM supprimé'; setTimeout(() => this.success = '', 3000); },
      error: (e) => this.confirm.open({ title: 'Erreur', message: e?.error?.message || 'Erreur lors de la suppression', confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' })
    });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
}
