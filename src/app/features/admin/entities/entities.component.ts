import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { EntityOrg, EntityMng, EntitySector, PageResponse } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

@Component({ selector: 'app-entities', templateUrl: './entities.component.html' })
export class EntitiesComponent implements OnInit {
  page: PageResponse<EntityOrg> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  managers: EntityMng[] = [];
  loading = false; showModal = false; editMode = false;
  selectedCode: string | null = null;
  form!: FormGroup; error = ''; success = '';
  sectors = Object.values(EntitySector);

  constructor(private api: ApiService, private fb: FormBuilder, private confirm: ConfirmDialogService) {}

  ngOnInit() { this.load(); this.loadManagers(); }

  load(p = 0) {
    this.loading = true;
    this.api.getEntities(p, 8).subscribe({ next: r => { this.page = r; this.loading = false; }, error: () => this.loading = false });
  }

  loadManagers() {
    this.api.getEntityManagers(0, 100).subscribe({ next: r => this.managers = r.content });
  }

  openCreate() {
    this.editMode = false; this.selectedCode = null; this.error = '';
    this.form = this.fb.group({ name: ['', Validators.required], sector: [''], adresse: [''], description: [''], entityManagerId: [''] });
    this.showModal = true;
  }

  openEdit(e: EntityOrg) {
    this.editMode = true; this.selectedCode = e.code; this.error = '';
    this.form = this.fb.group({ name: [e.name, Validators.required], sector: [e.sector], adresse: [e.adresse], description: [e.description], entityManagerId: [e.entityManagerId] });
    this.showModal = true;
  }

  save() {
    if (this.form.invalid) return;
    const obs = this.editMode ? this.api.updateEntity(this.selectedCode!, this.form.value) : this.api.createEntity(this.form.value);
    obs.subscribe({ next: () => { this.showModal = false; this.load(this.page.page); this.success = this.editMode ? 'Entité modifiée' : 'Entité créée'; setTimeout(() => this.success = '', 3000); }, error: (e) => this.error = e?.error?.message || 'Erreur' });
  }

  async delete(code: string) {
    const ok = await this.confirm.open({
      title: 'Supprimer l\'entité',
      message: 'Cette entité et toutes ses données associées seront supprimées définitivement.',
      confirmLabel: 'Supprimer',
      type: 'danger'
    });
    if (!ok) return;
    this.api.deleteEntity(code).subscribe({
      next: () => { this.load(this.page.page); this.success = 'Entité supprimée'; setTimeout(() => this.success = '', 3000); },
      error: (e) => this.confirm.open({ title: 'Erreur', message: e?.error?.message || 'Erreur lors de la suppression', confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' })
    });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
}
