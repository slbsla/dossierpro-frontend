import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { EmSessionService, EmSelectedEntity } from '../../../core/services/em-session.service';

@Component({
  selector: 'app-em-entity-picker',
  templateUrl: './em-entity-picker.component.html',
  styleUrls: ['./em-entity-picker.component.css']
})
export class EmEntityPickerComponent implements OnInit {
  @Output() entitySelected = new EventEmitter<void>();

  query = '';
  results: { code: string; name: string; sector: string }[] = [];
  loading = false;
  searched = false;      // true after first search attempt
  noEntityAssigned = false;

  private search$ = new Subject<string>();

  constructor(
    private api: ApiService,
    public emSession: EmSessionService
  ) {}

  ngOnInit(): void {
    // Load all entities for this EM on open (to auto-select if only one)
    this.loading = true;
    this.api.getEmMyEntities().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.length === 0) {
          this.noEntityAssigned = true;
        } else if (res.length === 1) {
          this.select(res[0]);
        } else {
          this.results = res;
          this.searched = true;
        }
      },
      error: () => { this.loading = false; }
    });

    // Debounced search on typing
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        this.loading = true;
        this.searched = false;
        return this.api.getEmMyEntities(q);
      })
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.searched = true;
        this.results = res;
        this.noEntityAssigned = res.length === 0 && !this.query;
      },
      error: () => { this.loading = false; this.searched = true; }
    });
  }

  onQueryChange(): void {
    if (this.query.length === 0 || this.query.length >= 2) {
      this.search$.next(this.query);
    }
  }

  select(entity: EmSelectedEntity): void {
    this.emSession.select(entity);
    this.entitySelected.emit();
  }
}
