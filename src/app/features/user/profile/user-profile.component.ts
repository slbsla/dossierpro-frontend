import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { EntityUser } from '../../../core/models/models';

@Component({ selector: 'app-user-profile', templateUrl: './user-profile.component.html', styleUrls: ['./user-profile.component.css'] })
export class UserProfileComponent implements OnInit {
  profile: EntityUser | null = null;
  form!: FormGroup; editMode = false; loading = true;
  success = ''; error = '';

  // Photo
  photoUrl: string | null = null;
  photoUploading = false;
  photoError = '';

  constructor(private api: ApiService, private auth: AuthService, private fb: FormBuilder) {}

  ngOnInit() {
    this.api.getUserProfile().subscribe({
      next: p => {
        this.profile = p;
        this.loading = false;
        this.initForm(p);
        if (p.hasPhoto) this.refreshPhoto();
      },
      error: () => this.loading = false
    });
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

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // Validation côté client
    if (!file.type.startsWith('image/')) {
      this.photoError = 'Fichier non valide. Utilisez JPG, PNG ou WebP.'; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.photoError = 'Taille maximale : 5 Mo.'; return;
    }

    this.photoUploading = true; this.photoError = '';

    // Aperçu immédiat
    const reader = new FileReader();
    reader.onload = (e) => this.photoUrl = e.target?.result as string;
    reader.readAsDataURL(file);

    this.api.uploadProfilePhoto(file).subscribe({
      next: (p) => {
        this.profile = p;
        this.photoUploading = false;
        this.refreshPhoto();
        this.success = 'Photo mise à jour'; setTimeout(() => this.success = '', 3000);
      },
      error: () => { this.photoError = 'Erreur lors de l\'upload.'; this.photoUploading = false; }
    });
  }

  private refreshPhoto() {
    // Forcer le rechargement avec un timestamp pour éviter le cache navigateur
    const creds = this.auth.credentials;
    if (!creds) return;
    fetch(this.api.getProfilePhotoUrl(), {
      headers: { Authorization: `Basic ${creds}` }
    }).then(r => r.blob()).then(blob => {
      this.photoUrl = URL.createObjectURL(blob);
    }).catch(() => {});
  }

  triggerPhotoInput() {
    document.getElementById('photo-input')?.click();
  }
}
