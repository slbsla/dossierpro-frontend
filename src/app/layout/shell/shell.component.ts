import { Component } from '@angular/core';

@Component({
  selector: 'app-shell',
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <div class="app-main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }
    .app-main {
      flex: 1;
      overflow: auto;
      background: var(--bg-light, #f8fafc);
    }
  `]
})
export class ShellComponent {}
