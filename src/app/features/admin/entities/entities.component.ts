import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { EntityOrg, EntityMng, EntitySector, PageResponse, ManagerSummary } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

@Component({ selector: 'app-entities', templateUrl: './entities.component.html' })
export class EntitiesComponent implements OnInit {
  page: PageResponse<EntityOrg> = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0, last: true };
  managers: EntityMng[] = [];
  loading = false; showModal = false; editMode = false;
  selectedCode: string | null = null;
  selectedEntityPendingCount = 0;
  form!: FormGroup; error = ''; success = '';
  originalValues: any = {};
  sectors = Object.values(EntitySector);

  // Filter by entity manager
  filterManagerId = '';

  // Managers additionnels (rôle différent d'Entity Manager)
  selectedExtraManagers: ManagerSummary[] = [];
  originalExtraManagers: ManagerSummary[] = [];
  extraManagerToAdd = '';

  // Inline EM detail panel
  expandedEntityCode: string | null = null;
  selectedEmDetail: EntityMng | null = null;

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
    this.api.getEntities(p, 8, this.filterManagerId || undefined).subscribe({ next: r => { this.page = r; this.loading = false; }, error: () => this.loading = false });
  }

  applyFilter() { this.expandedEntityCode = null; this.selectedEmDetail = null; this.load(0); }

  toggleEmDetail(e: EntityOrg) {
    if (!e.entityManagerId) return;
    if (this.expandedEntityCode === e.code) {
      this.expandedEntityCode = null; this.selectedEmDetail = null; return;
    }
    this.expandedEntityCode = e.code;
    this.selectedEmDetail = null;
    this.api.getEntityManager(e.entityManagerId).subscribe({ next: m => this.selectedEmDetail = m, error: () => this.selectedEmDetail = null });
  }

  loadManagers() {
    this.api.getEntityManagers(0, 100).subscribe({ next: r => this.managers = r.content });
  }

  /**
   * Managers éligibles comme Entity Manager principal : uniquement ceux ayant
   * le rôle "Entity Manager" (les autres rôles ne peuvent être que managers additionnels).
   */
  get primaryManagers(): EntityMng[] {
    return this.managers.filter(m => m.roleName === 'Entity Manager');
  }

  /**
   * Managers éligibles comme managers additionnels : rôle différent d'Entity Manager,
   * pas déjà ajoutés à cette entité, et "libres" (pas déjà attachés à une autre entité —
   * contrairement à l'Entity Manager principal, un manager additionnel ne peut gérer
   * qu'une seule entité à la fois).
   */
  get availableExtraManagers(): EntityMng[] {
    const selectedRefs = new Set(this.selectedExtraManagers.map(m => m.reference));
    return this.managers.filter(m =>
      m.roleName !== 'Entity Manager' &&
      !selectedRefs.has(m.reference) &&
      (m.extraManagerCount || 0) === 0
    );
  }

  addExtraManager() {
    if (!this.extraManagerToAdd) return;
    const m = this.managers.find(mg => mg.reference === this.extraManagerToAdd);
    if (m && !this.selectedExtraManagers.some(em => em.reference === m.reference)) {
      this.selectedExtraManagers.push({ reference: m.reference, firstName: m.firstName, lastName: m.lastName, roleName: m.roleName });
    }
    this.extraManagerToAdd = '';
  }

  removeExtraManager(ref: string) {
    this.selectedExtraManagers = this.selectedExtraManagers.filter(m => m.reference !== ref);
  }

  openCreate() {
    this.editMode = false; this.selectedCode = null; this.error = '';
    this.selectedEntityPendingCount = 0;
    this.selectedExtraManagers = []; this.extraManagerToAdd = '';
    this.loadManagers();
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
    this.selectedEntityPendingCount = e.pendingDossiersCount || 0;
    this.selectedExtraManagers = (e.extraManagers || []).map(m => ({ ...m }));
    this.originalExtraManagers = (e.extraManagers || []).map(m => ({ ...m }));
    this.extraManagerToAdd = '';
    this.loadManagers();
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
      entityManagerId: [{ value: e.entityManagerId, disabled: this.selectedEntityPendingCount > 0 }]
    });
    this.showModal = true;
  }

  resetForm() {
    this.form.patchValue(this.originalValues);
    this.selectedExtraManagers = this.originalExtraManagers.map(m => ({ ...m }));
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
    const extraManagerIds = this.selectedExtraManagers.map(m => m.reference);
    const payload = this.editMode
      ? { ...this.form.getRawValue(), extraManagerIds }
      : { ...this.form.value, extraManagerIds };
    const obs = this.editMode ? this.api.updateEntity(this.selectedCode!, payload) : this.api.createEntity(payload);
    obs.subscribe({ next: () => { this.showModal = false; this.load(this.page.page); this.success = this.editMode ? 'Entité modifiée' : 'Entité créée'; setTimeout(() => this.success = '', 3000); }, error: (e) => this.error = e?.error?.message || 'Erreur' });
  }

  async delete(e: EntityOrg) {
    const users = e.userCount || 0;

    // Has users + has EM → deletion blocked, EM must clear users first
    if (users > 0 && e.entityManagerId) {
      await this.confirm.open({
        title: 'Suppression impossible',
        message: `Cette entité contient ${users} utilisateur(s). L'Entity Manager "${e.entityManagerName || e.entityManagerId}" doit d'abord supprimer tous les utilisateurs avant que l'entité puisse être supprimée.`,
        confirmLabel: 'OK',
        cancelLabel: ' ',
        type: 'warning'
      });
      return;
    }

    // Has users but no EM → warn admin but allow
    const message = users > 0
      ? `Cette entité contient ${users} utilisateur(s) et n'a pas d'Entity Manager assigné. Supprimer quand même ?`
      : 'Cette entité et toutes ses données associées seront supprimées définitivement.';

    const ok = await this.confirm.open({
      title: 'Supprimer l\'entité',
      message,
      confirmLabel: 'Supprimer',
      type: 'danger'
    });
    if (!ok) return;
    this.api.deleteEntity(e.code).subscribe({
      next: () => { this.load(this.page.page); this.success = 'Entité supprimée'; setTimeout(() => this.success = '', 3000); },
      error: (err) => this.confirm.open({ title: 'Erreur', message: err?.error?.message || 'Erreur lors de la suppression', confirmLabel: 'OK', cancelLabel: ' ', type: 'warning' })
    });
  }

  pages() { return Array.from({ length: this.page.totalPages }, (_, i) => i); }
}
