import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RegisterComponent } from './register/register.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'acces-reserve', component: AccessDeniedComponent }
];

@NgModule({
  declarations: [LoginComponent, ChangePasswordComponent, RegisterComponent, AccessDeniedComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SharedModule, RouterModule.forChild(routes)]
})
export class AuthModule {}
