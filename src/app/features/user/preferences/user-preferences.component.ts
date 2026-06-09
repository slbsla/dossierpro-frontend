import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { UserPref, Theme, Language } from '../../../core/models/models';

@Component({ selector: 'app-user-preferences', templateUrl: './user-preferences.component.html' })
export class UserPreferencesComponent implements OnInit {
  prefs: UserPref | null = null;
  loading = true; saving = false;
  success = ''; error = '';
  Theme = Theme; Language = Language;

  constructor(private api: ApiService) {}
  ngOnInit() { this.api.getUserPrefs().subscribe({ next: p => { this.prefs = { ...p }; this.loading = false; }, error: () => this.loading = false }); }

  save() {
    this.saving = true; this.error = '';
    this.api.saveUserPrefs(this.prefs!).subscribe({
      next: p => { this.prefs = p; this.saving = false; this.success = 'Préférences sauvegardées'; setTimeout(() => this.success = '', 3000); },
      error: (e) => { this.error = e?.error?.message || 'Erreur'; this.saving = false; }
    });
  }
}
