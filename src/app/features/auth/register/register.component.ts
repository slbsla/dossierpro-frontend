import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Component({ selector: 'app-register', templateUrl: './register.component.html', styleUrls: ['./register.component.css'] })
export class RegisterComponent {
  step = 1;
  done = false;
  loading = false;
  error = '';

  // Step 1
  infoForm: FormGroup;

  // Step 2
  entitySearch = '';
  entitySuggestions: {code: string; name: string}[] = [];
  selectedEntity: {code: string; name: string} | null = null;
  entitySearching = false;
  private entity$ = new Subject<string>();

  // Step 3
  secForm: FormGroup;
  showPass = false;
  showConfirm = false;

  // Step 4
  acceptCguApp = false;
  acceptCguEntity = false;

  // Confirmation
  registeredRef = '';

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    this.infoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      telephone: [''],
      email:     ['', Validators.email]
    });
    this.secForm = this.fb.group({
      password:        ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    });

    this.entity$.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(val => this.fetchSuggestions(val));
  }

  /* ── Step navigation ── */
  next() {
    if (this.step === 1 && this.infoForm.invalid) return;
    if (this.step === 2 && !this.selectedEntity) return;
    if (this.step === 3) {
      if (this.secForm.invalid) return;
      if (this.secForm.value.password !== this.secForm.value.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas.'; return;
      }
    }
    this.error = '';
    this.step++;
  }

  back() { if (this.step > 1) { this.step--; this.error = ''; } }

  /* ── Entity autocomplete ── */
  onEntityInput(val: string) {
    this.entitySearch = val;
    this.selectedEntity = null;
    if (val.trim().length >= 2) this.entity$.next(val.trim());
    else this.entitySuggestions = [];
  }

  fetchSuggestions(name: string) {
    this.entitySearching = true;
    this.api.searchPublicEntities(name).subscribe({
      next: list => { this.entitySuggestions = list; this.entitySearching = false; },
      error: () => { this.entitySuggestions = []; this.entitySearching = false; }
    });
  }

  selectEntity(e: {code: string; name: string}) {
    this.selectedEntity = e;
    this.entitySearch = e.name;
    this.entitySuggestions = [];
  }

  /* ── Final submit ── */
  get canConfirm() { return this.acceptCguApp && this.acceptCguEntity; }

  confirm() {
    if (!this.canConfirm) return;
    this.loading = true; this.error = '';
    this.api.registerProspect({
      ...this.infoForm.value,
      entityCode: this.selectedEntity!.code,
      password: this.secForm.value.password
    }).subscribe({
      next: (res: any) => { this.registeredRef = res?.reference || ''; this.done = true; this.loading = false; },
      error: (e) => { this.error = e?.error?.message || 'Une erreur est survenue.'; this.loading = false; }
    });
  }

  goLogin() { this.router.navigate(['/login']); }
}
