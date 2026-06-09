import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-change-password', templateUrl: './change-password.component.html', styleUrls: ['./change-password.component.css'] })
export class ChangePasswordComponent {
  form: FormGroup;
  error = ''; success = ''; loading = false;
  showCurrent = false; showNew = false; showConfirm = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.form.value;
    if (newPassword !== confirmPassword) { this.error = 'Les mots de passe ne correspondent pas'; return; }
    this.loading = true; this.error = '';
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.success = 'Mot de passe confirmé ! Redirection...';
        setTimeout(() => this.router.navigate([this.auth.getHomeRoute()]), 1200);
      },
      error: (e) => { this.error = e?.error?.message || 'Mot de passe actuel incorrect'; this.loading = false; }
    });
  }
}
