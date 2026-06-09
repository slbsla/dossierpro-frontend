import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html', styleUrls: ['./login.component.css'] })
export class LoginComponent {
  form: FormGroup;
  error = '';
  errorType: 'credentials' | 'disabled' | '' = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = ''; this.errorType = '';
    const { username, password } = this.form.value;

    this.auth.login(username, password).subscribe({
      next: (user) => {
        if (user.isFirstConnexion) this.router.navigate(['/change-password']);
        else this.router.navigate([this.auth.getHomeRoute()]);
      },
      error: (err) => {
        // 401 = mauvais identifiants (Spring Security rejette avant même d'appeler /me)
        // 403 = mot de passe correct MAIS compte désactivé (check dans AuthService.getCurrentUser)
        if (err.status === 403) {
          this.errorType = 'disabled';
        } else {
          this.errorType = 'credentials';
        }
        this.loading = false;
      }
    });
  }
}
