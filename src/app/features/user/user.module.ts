import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { UserDossiersComponent } from './dossiers/user-dossiers.component';
import { UserProfileComponent } from './profile/user-profile.component';
import { UserPreferencesComponent } from './preferences/user-preferences.component';
import { UserUploadComponent } from './upload/user-upload.component';
import { UserDashboardComponent } from './dashboard/user-dashboard.component';
import { UserBankComponent } from './bank/user-bank.component';
import { UserSupportComponent } from './support/user-support.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: UserDashboardComponent },
  { path: 'dossiers', component: UserDossiersComponent },
  { path: 'upload', component: UserUploadComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'preferences', component: UserPreferencesComponent },
  { path: 'paiement', component: UserBankComponent },
  { path: 'support', component: UserSupportComponent }
];

@NgModule({
  declarations: [
    UserDossiersComponent, UserProfileComponent, UserPreferencesComponent,
    UserUploadComponent, UserDashboardComponent, UserBankComponent,
    UserSupportComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutModule, RouterModule.forChild(routes)]
})
export class UserModule {}
