import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [SidebarComponent, NavbarComponent],
  imports: [CommonModule, RouterModule],
  exports: [SidebarComponent, NavbarComponent]
})
export class LayoutModule {}
