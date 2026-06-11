import { Component } from '@angular/core';
import { EmSessionService } from '../../../core/services/em-session.service';

@Component({
  selector: 'app-em-shell',
  templateUrl: './em-shell.component.html',
  styles: [`
    :host { display: contents; }
  `]
})
export class EmShellComponent {
  constructor(public emSession: EmSessionService) {}

  onEntitySelected(): void {
    // The service already persisted the selection; change detection handles the rest
  }
}
