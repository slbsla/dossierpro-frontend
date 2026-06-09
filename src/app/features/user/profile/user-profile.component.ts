import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { EntityUser } from '../../../core/models/models';

@Component({ selector: 'app-user-profile', templateUrl: './user-profile.component.html' })
export class UserProfileComponent implements OnInit {
  profile: EntityUser | null = null;
  form!: FormGroup; editMode = false; loading = true;
  success = ''; error = '';

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit() {
    this.api.getUserProfile().subscribe({ next: p => { this.profile = p; this.loading = false; this.initForm(p); }, error: () => this.loading = false });
  }

  initForm(p: EntityUser) {
    this.form = this.fb.group({ firstName: [p.firstName], lastName: [p.lastName], telephone: [p.telephone], email: [p.email] });
  }

  save() {
    this.api.updateUserProfile(this.form.value).subscribe({
      next: p => { this.profile = p; this.editMode = false; this.success = 'Profil mis à jour'; setTimeout(() => this.success = '', 3000); },
      error: (e) => this.error = e?.error?.message || 'Erreur'
    });
  }
}
