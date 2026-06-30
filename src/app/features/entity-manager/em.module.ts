import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { SharedModule } from '../../shared/shared.module';
import { EmDashboardComponent } from './dashboard/em-dashboard.component';
import { EmInfoComponent } from './info/em-info.component';
import { EmUsersComponent } from './users/em-users.component';
import { EmDossiersComponent } from './dossiers/em-dossiers.component';
import { EmShellComponent } from './shell/em-shell.component';
import { EmEntityPickerComponent } from './entity-picker/em-entity-picker.component';
import { SupportTicketsComponent } from '../../shared/support-tickets/support-tickets.component';
import { EmMessagesComponent } from './messages/em-messages.component';

const routes: Routes = [
  {
    path: '',
    component: EmShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmDashboardComponent },
      { path: 'info', component: EmInfoComponent },
      { path: 'users', component: EmUsersComponent },
      { path: 'dossiers', component: EmDossiersComponent },
      { path: 'support', component: SupportTicketsComponent },
      { path: 'messages', component: EmMessagesComponent }
    ]
  }
];

@NgModule({
  declarations: [
    EmDashboardComponent,
    EmInfoComponent,
    EmUsersComponent,
    EmDossiersComponent,
    EmShellComponent,
    EmEntityPickerComponent,
    EmMessagesComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutModule, SharedModule, RouterModule.forChild(routes)]
})
export class EmModule {}
