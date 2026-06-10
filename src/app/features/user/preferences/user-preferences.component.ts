import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserPref, Theme, Language } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

@Component({ selector: 'app-user-preferences', templateUrl: './user-preferences.component.html' })
export class UserPreferencesComponent implements OnInit {
  prefs: UserPref | null = null;
  loading = true; saving = false; deleting = false;
  success = ''; error = '';
  Theme = Theme; Language = Language;

  constructor(private api: ApiService, private auth: AuthService, private confirm: ConfirmDialogService) {}
  ngOnInit() { this.api.getUserPrefs().subscribe({ next: p => { this.prefs = { ...p }; this.loading = false; }, error: () => this.loading = false }); }

  save() {
    this.saving = true; this.error = '';
    this.api.saveUserPrefs(this.prefs!).subscribe({
      next: p => { this.prefs = p; this.saving = false; this.success = 'Préférences sauvegardées'; setTimeout(() => this.success = '', 3000); },
      error: (e) => { this.error = e?.error?.message || 'Erreur'; this.saving = false; }
    });
  }

  async deleteAccount() {
    const ok = await this.confirm.open({
      title: 'Supprimer mon compte',
      message: 'Cette action est irréversible. Votre compte et tous vos dossiers seront définitivement supprimés. Êtes-vous sûr(e) ?',
      confirmLabel: 'Supprimer mon compte',
      cancelLabel: 'Annuler',
      type: 'danger'
    });
    if (!ok) return;
    this.deleting = true;
    this.api.deleteMyAccount().subscribe({
      next: () => this.auth.logout(),
      error: (e) => { this.error = e?.error?.message || 'Erreur lors de la suppression'; this.deleting = false; }
    });
  }
}
