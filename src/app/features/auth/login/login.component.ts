import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({ selector: 'app-login', templateUrl: './login.component.html', styleUrls: ['./login.component.css'] })
export class LoginComponent {
  form: FormGroup;
  error = '';
  errorType: 'credentials' | 'disabled' | '' = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private http: HttpClient) {
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
        if (err.status === 401) {
          // Vérifier si c'est un compte désactivé
          this.http.get<{ status: string }>(`http://localhost:8080/api/auth/account-status?username=${encodeURIComponent(username)}`)
            .subscribe({
              next: (res) => {
                if (res.status === 'DISABLED') {
                  this.errorType = 'disabled';
                  this.error = 'disabled';
                } else {
                  this.errorType = 'credentials';
                  this.error = 'credentials';
                }
                this.loading = false;
              },
              error: () => {
                this.errorType = 'credentials';
                this.error = 'credentials';
                this.loading = false;
              }
            });
        } else {
          this.errorType = 'credentials';
          this.error = 'credentials';
          this.loading = false;
        }
      }
    });
  }
}
