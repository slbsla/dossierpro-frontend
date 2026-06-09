import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html', styleUrls: ['./login.component.css'] })
export class LoginComponent {
  form: FormGroup;
  error = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const { username, password } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: (user) => {
        if (user.isFirstConnexion) this.router.navigate(['/change-password']);
        else this.router.navigate([this.auth.getHomeRoute()]);
      },
      error: () => { this.error = 'Identifiants invalides. Vérifiez votre login et mot de passe.'; this.loading = false; }
    });
  }
}
