import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ShellComponent } from './shell/shell.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [SidebarComponent, NavbarComponent, ShellComponent, FooterComponent],
  imports: [CommonModule, RouterModule],
  exports: [SidebarComponent, NavbarComponent, ShellComponent, FooterComponent]
})
export class LayoutModule {}
