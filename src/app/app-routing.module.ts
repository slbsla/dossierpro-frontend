import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ShellComponent } from './layout/shell/shell.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    component: ShellComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'em',
    component: ShellComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ENTITY_MANAGER'] },
    loadChildren: () => import('./features/entity-manager/em.module').then(m => m.EmModule)
  },
  {
    path: 'user',
    component: ShellComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['USER'] },
    loadChildren: () => import('./features/user/user.module').then(m => m.UserModule)
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
