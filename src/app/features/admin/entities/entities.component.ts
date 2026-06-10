import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  originalValues: any = {};
  sectors = Object.values(EntitySector);

  // Autocomplete adresse
  suggestions: any[] = [];
  showSuggestions = false;
  addressLinked = false;       // true = champs remplis via API
  private searchTimer: any;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private confirm: ConfirmDialogService,
    private http: HttpClient
  ) {}

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
    this.form = this.fb.group({
      name:            ['', Validators.required],
      sector:          [''],
      adresse:         ['', Validators.required],
      numero:          ['', Validators.required],
      ligne:           ['', Validators.required],
      postcode:        ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      ville:           ['', Validators.required],
      description:     [''],
      entityManagerId: ['']
    });
    this.showModal = true;
  }

  openEdit(e: EntityOrg) {
    this.editMode = true; this.selectedCode = e.code; this.error = '';
    this.originalValues = {
      name: e.name, sector: e.sector,
      adresse: e.adresse, numero: e.numero, ligne: e.ligne, postcode: e.postcode, ville: e.ville,
      description: e.description, entityManagerId: e.entityManagerId
    };
    this.form = this.fb.group({
      name:            [e.name, Validators.required],
      sector:          [e.sector],
      adresse:         [e.adresse, Validators.required],
      numero:          [e.numero, Validators.required],
      ligne:           [e.ligne, Validators.required],
      postcode:        [e.postcode, [Validators.required, Validators.pattern(/^\d{5}$/)]],
      ville:           [e.ville, Validators.required],
      description:     [e.description],
      entityManagerId: [e.entityManagerId]
    });
    this.showModal = true;
  }

  resetForm() {
    this.form.patchValue(this.originalValues);
    this.suggestions = []; this.showSuggestions = false; this.addressLinked = false;
    this.error = '';
  }

  // ── Autocomplete ──────────────────────────────────────────────────────────

  onAdresseInput(event: Event) {
    const q = (event.target as HTMLInputElement).value.trim();
    this.addressLinked = false;
    this.clearStructuredFields();
    clearTimeout(this.searchTimer);
    if (q.length < 3) { this.suggestions = []; this.showSuggestions = false; return; }
    this.searchTimer = setTimeout(() => this.searchAdresse(q), 350);
  }

  searchAdresse(q: string) {
    this.http.get<any>(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5&countrycodes=fr`)
      .subscribe({
        next: res => {
          this.suggestions = (res.features || []).slice(0, 5);
          this.showSuggestions = this.suggestions.length > 0;
        },
        error: () => { this.suggestions = []; this.showSuggestions = false; }
      });
  }

  selectSuggestion(f: any) {
    const p = f.properties;
    this.form.patchValue({
      adresse:  p.label        || '',
      numero:   p.housenumber  || '',
      ligne:    p.street       || p.name || '',
      postcode: p.postcode     || '',
      ville:    p.city         || ''
    });
    this.suggestions = []; this.showSuggestions = false;
    this.addressLinked = true;
  }

  onStructuredFieldChange() {
    if (this.addressLinked) {
      // L'utilisateur modifie manuellement un champ structuré → tout vider
      this.form.patchValue({ adresse: '', numero: '', ligne: '', postcode: '', ville: '' });
      this.addressLinked = false;
      this.suggestions = []; this.showSuggestions = false;
    }
  }

  closeSuggestions() {
    setTimeout(() => { this.showSuggestions = false; }, 200);
  }

  private clearStructuredFields() {
    this.form.patchValue({ numero: '', ligne: '', postcode: '', ville: '' }, { emitEvent: false });
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
