import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { SharedModule } from '../../shared/shared.module';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { EntitiesComponent } from './entities/entities.component';
import { EntityManagersComponent } from './entity-managers/entity-managers.component';
import { RolesComponent } from './roles/roles.component';
import { SupportTicketsComponent } from '../../shared/support-tickets/support-tickets.component';
import { SchedulerComponent } from './scheduler/scheduler.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'entities', component: EntitiesComponent },
  { path: 'entity-managers', component: EntityManagersComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'support', component: SupportTicketsComponent },
  { path: 'scheduler', component: SchedulerComponent }
];

@NgModule({
  declarations: [AdminDashboardComponent, EntitiesComponent, EntityManagersComponent, RolesComponent, SchedulerComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutModule, SharedModule, RouterModule.forChild(routes)]
})
export class AdminModule {}
