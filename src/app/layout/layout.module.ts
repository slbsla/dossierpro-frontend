import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ShellComponent } from './shell/shell.component';

@NgModule({
  declarations: [SidebarComponent, NavbarComponent, ShellComponent],
  imports: [CommonModule, RouterModule],
  exports: [SidebarComponent, NavbarComponent, ShellComponent]
})
export class LayoutModule {}
