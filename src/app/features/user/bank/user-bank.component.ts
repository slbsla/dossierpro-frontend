import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { UserBankInfo } from '../../../core/models/models';

interface AdresseSuggestion {
  label: string;
  numero?: string;
  ligne?: string;
  postcode?: string;
  ville?: string;
}

@Component({
  selector: 'app-user-bank',
  templateUrl: './user-bank.component.html'
})
export class UserBankComponent implements OnInit {

  bankInfo: UserBankInfo | null = null;
  loading = true;
  editMode = false;
  confirmDelete = false;
  saving = false;
  deleting = false;
  success = '';
  error = '';

  form!: FormGroup;

  // Autocomplete adresse
  adresseSuggestions: AdresseSuggestion[] = [];
  adresseLoading = false;
  private adresseTimer: any;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.initForm();
    this.api.getBankInfo().subscribe({
      next: info => {
        this.bankInfo = info;
        this.loading = false;
      },
      error: (e) => {
        // 404 = pas encore d'info enregistrée → mode création
        if (e.status === 404) {
          this.bankInfo = null;
          this.editMode = true; // ouvrir directement le formulaire
        }
        this.loading = false;
      }
    });
  }

  private initForm(info?: UserBankInfo) {
    this.form = this.fb.group({
      nomBanque:        [info?.nomBanque        ?? '', [Validators.required, Validators.minLength(2)]],
      adresseTitulaire: [info?.adresseTitulaire ?? '', Validators.required],
      nomTitulaire:     [info?.nomTitulaire     ?? '', [Validators.required, Validators.minLength(2)]],
      iban:             [info?.iban             ?? '', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/)]],
      bicSwift:         [info?.bicSwift         ?? '', [Validators.required, Validators.pattern(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/)]],
      acceptedStorage:  [false, Validators.requiredTrue]
    });
  }

  startEdit() {
    // En mode édition, IBAN affiché masqué → on vide pour saisie
    this.initForm({ ...this.bankInfo!, iban: '' } as any);
    this.editMode = true;
    this.error = '';
    this.success = '';
  }

  cancelEdit() {
    this.editMode = false;
    this.error = '';
    if (!this.bankInfo) {
      // Pas encore de donnée : rester sur l'écran vide
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    const payload = {
      ...this.form.value,
      iban: this.form.value.iban.trim().toUpperCase().replace(/\s+/g, ''),
      bicSwift: this.form.value.bicSwift.trim().toUpperCase()
    };
    this.api.saveBankInfo(payload).subscribe({
      next: info => {
        this.bankInfo = info;
        this.editMode = false;
        this.saving = false;
        this.success = 'Informations bancaires enregistrées avec succès.';
        setTimeout(() => this.success = '', 4000);
      },
      error: (e) => {
        this.error = e?.error?.message || 'Erreur lors de la sauvegarde.';
        this.saving = false;
      }
    });
  }

  askDelete() {
    this.confirmDelete = true;
  }

  cancelDelete() {
    this.confirmDelete = false;
  }

  confirmDeletion() {
    this.deleting = true;
    this.api.deleteBankInfo().subscribe({
      next: () => {
        this.bankInfo = null;
        this.editMode = true;
        this.confirmDelete = false;
        this.deleting = false;
        this.initForm();
        this.success = 'Informations bancaires supprimées.';
        setTimeout(() => this.success = '', 4000);
      },
      error: () => {
        this.error = 'Erreur lors de la suppression.';
        this.confirmDelete = false;
        this.deleting = false;
      }
    });
  }

  // ── Autocomplete adresse ─────────────────────────────────────────────────────

  onAdresseInput(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    clearTimeout(this.adresseTimer);
    if (!q || q.length < 3) { this.adresseSuggestions = []; return; }
    this.adresseTimer = setTimeout(() => {
      this.adresseLoading = true;
      this.http.get<any>(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`).subscribe({
        next: res => {
          this.adresseSuggestions = (res.features ?? []).map((f: any) => ({
            label:    f.properties.label,
            numero:   f.properties.housenumber ?? '',
            ligne:    f.properties.name        ?? '',
            postcode: f.properties.postcode    ?? '',
            ville:    f.properties.city        ?? ''
          }));
          this.adresseLoading = false;
        },
        error: () => { this.adresseSuggestions = []; this.adresseLoading = false; }
      });
    }, 300);
  }

  selectSuggestion(s: AdresseSuggestion) {
    this.form.patchValue({ adresseTitulaire: s.label });
    this.adresseSuggestions = [];
  }

  closeSuggestions() {
    setTimeout(() => this.adresseSuggestions = [], 200);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  get ibanCtrl()        { return this.form.get('iban')!; }
  get bicCtrl()         { return this.form.get('bicSwift')!; }
  get nomBanque()       { return this.form.get('nomBanque')!; }
  get nomTitulaire()    { return this.form.get('nomTitulaire')!; }
  get adresseCtrl()     { return this.form.get('adresseTitulaire')!; }
  get accepted()        { return this.form.get('acceptedStorage')!; }

  get ibanHint() {
    if (!this.ibanCtrl.value) return '';
    const raw = (this.ibanCtrl.value as string).replace(/\s/g, '');
    return raw.match(/^[A-Z]{2}[0-9]{2}/) ? '' : 'Format : FR76... (lettres majuscules, sans espaces)';
  }

  onIbanInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const clean = val.toUpperCase().replace(/\s/g, '');
    this.ibanCtrl.setValue(clean, { emitEvent: false });
    (event.target as HTMLInputElement).value = clean;
  }

  onBicInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const clean = val.toUpperCase();
    this.bicCtrl.setValue(clean, { emitEvent: false });
    (event.target as HTMLInputElement).value = clean;
  }
}
