import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ManagerRole } from '../../../core/models/models';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
  roles: ManagerRole[] = [];
  loading = true;
  error = '';

  selected: ManagerRole | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  selectRow(r: ManagerRole): void {
    this.selected = this.isSelected(r) ? null : r;
  }

  isSelected(r: ManagerRole): boolean {
    return this.selected?.id === r.id;
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.getManagerRoles().subscribe({
      next: roles => { this.roles = roles; this.loading = false; },
      error: () => { this.error = 'Impossible de charger les rôles.'; this.loading = false; }
    });
  }
}
