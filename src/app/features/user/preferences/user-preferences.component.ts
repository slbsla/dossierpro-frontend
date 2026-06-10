import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserPref, Theme, Language } from '../../../core/models/models';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

@Component({ selector: 'app-user-preferences', templateUrl: './user-preferences.component.html' })
export class UserPreferencesComponent implements OnInit {
  prefs: UserPref | null = null;
  loading = true; saving = false; deleting = false; changingPwd = false;
  success = ''; error = ''; pwdSuccess = ''; pwdError = '';
  Theme = Theme; Language = Language;
  pwdForm!: FormGroup;
  showCurrentPwd = false; showNewPwd = false; showConfirmPwd = false;

  constructor(private api: ApiService, private auth: AuthService, private confirm: ConfirmDialogService, private fb: FormBuilder) {}

  ngOnInit() {
    this.api.getUserPrefs().subscribe({ next: p => { this.prefs = { ...p }; this.loading = false; }, error: () => this.loading = false });
    this.pwdForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  changePassword() {
    if (this.pwdForm.invalid) return;
    this.changingPwd = true; this.pwdError = ''; this.pwdSuccess = '';
    const { currentPassword, newPassword } = this.pwdForm.value;
    this.api.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.changingPwd = false;
        this.pwdSuccess = 'Mot de passe modifié avec succès';
        this.pwdForm.reset();
        setTimeout(() => this.pwdSuccess = '', 4000);
      },
      error: (e) => {
        this.changingPwd = false;
        this.pwdError = e?.error?.message || 'Mot de passe actuel incorrect';
      }
    });
  }

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
