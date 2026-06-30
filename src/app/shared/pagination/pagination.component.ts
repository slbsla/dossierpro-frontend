import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Pagination compacte et réutilisable : affiche toujours la première et la
 * dernière page, une fenêtre de pages autour de la page courante, et des
 * "…" pour le reste — au lieu d'un bouton par page (illisible au-delà
 * d'une vingtaine de pages).
 *
 * Exemple avec 81 pages, page courante = 44 (0-based) :
 *   ◀ 1 … 44 45 46 … 81 ▶
 */
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  /** Page courante, 0-based (même convention que PageResponse). */
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() last = false;
  @Output() pageChange = new EventEmitter<number>();

  /** Nombre de pages affichées de part et d'autre de la page courante. */
  private readonly siblings = 1;

  /** Liste des numéros de page (0-based) à afficher ; -1 = "…". */
  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const maxButtons = 5 + this.siblings * 2;
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const start = Math.max(1, current - this.siblings);
    const end = Math.min(total - 2, current + this.siblings);

    const result: number[] = [0];
    if (start > 1) result.push(-1);
    for (let i = start; i <= end; i++) result.push(i);
    if (end < total - 2) result.push(-1);
    result.push(total - 1);
    return result;
  }

  go(p: number) {
    if (p < 0 || p >= this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }
}
