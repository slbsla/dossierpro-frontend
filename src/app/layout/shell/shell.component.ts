import { Component } from '@angular/core';

@Component({
  selector: 'app-shell',
  template: `
    <div class="app-layout">
      <div class="app-body">
        <app-sidebar></app-sidebar>
        <div class="app-main">
          <div class="app-content">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    .app-body {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg-light, #f8fafc);
      overflow-y: auto;
      min-height: 0;
    }
    .app-content {
      flex: 1;
    }
  `]
})
export class ShellComponent {}
