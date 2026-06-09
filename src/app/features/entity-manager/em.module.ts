import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { EmDashboardComponent } from './dashboard/em-dashboard.component';
import { EmInfoComponent } from './info/em-info.component';
import { EmUsersComponent } from './users/em-users.component';
import { EmDossiersComponent } from './dossiers/em-dossiers.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: EmDashboardComponent },
  { path: 'info', component: EmInfoComponent },
  { path: 'users', component: EmUsersComponent },
  { path: 'dossiers', component: EmDossiersComponent }
];

@NgModule({
  declarations: [EmDashboardComponent, EmInfoComponent, EmUsersComponent, EmDossiersComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutModule, RouterModule.forChild(routes)]
})
export class EmModule {}
