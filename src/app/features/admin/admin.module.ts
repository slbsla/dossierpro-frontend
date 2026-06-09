import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { EntitiesComponent } from './entities/entities.component';
import { EntityManagersComponent } from './entity-managers/entity-managers.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'entities', component: EntitiesComponent },
  { path: 'entity-managers', component: EntityManagersComponent }
];

@NgModule({
  declarations: [AdminDashboardComponent, EntitiesComponent, EntityManagersComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutModule, RouterModule.forChild(routes)]
})
export class AdminModule {}
