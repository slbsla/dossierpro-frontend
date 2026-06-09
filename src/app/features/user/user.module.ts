import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { UserDossiersComponent } from './dossiers/user-dossiers.component';
import { UserProfileComponent } from './profile/user-profile.component';
import { UserPreferencesComponent } from './preferences/user-preferences.component';

const routes: Routes = [
  { path: '', redirectTo: 'dossiers', pathMatch: 'full' },
  { path: 'dossiers', component: UserDossiersComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'preferences', component: UserPreferencesComponent }
];

@NgModule({
  declarations: [UserDossiersComponent, UserProfileComponent, UserPreferencesComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutModule, RouterModule.forChild(routes)]
})
export class UserModule {}
