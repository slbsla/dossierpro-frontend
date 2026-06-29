import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';
import {
  PageResponse, Role, Ticket, TicketStatus, TicketType, TicketPortail, TicketSize
} from '../../core/models/models';

@Component({
  selector: 'app-support-tickets',
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.css']
})
export class SupportTicketsComponent implements OnInit {

  Role = Role;
  TicketType = TicketType;
  TicketStatus = TicketStatus;
  TicketPortail = TicketPortail;
  TicketSize = TicketSize;

  readonly typeOptions: { value: TicketType; label: string }[] = [
    { value: TicketType.BUG, label: 'Incident' },
    { value: TicketType.ENHANCEMENT, label: 'Enhancement' },
    { value: TicketType.GROSSE_EVOLUTION, label: 'Grosse Evolution' },
    { value: TicketType.TECHNICAL, label: 'Technical' }
  ];

  readonly statusOptions: { value: TicketStatus; label: string }[] = [
    { value: TicketStatus.OUVERT, label: 'Ouvert' },
    { value: TicketStatus.EN_COURS, label: 'En cours' },
    { value: TicketStatus.CLOTURE, label: 'Clôturé' }
  ];

  readonly portailOptions: { value: TicketPortail; label: string }[] = [
    { value: TicketPortail.MANAGER_PORTAL, label: 'Manager portail' },
    { value: TicketPortail.ADMIN_PORTAL, label: 'Admin portail' },
    { value: TicketPortail.CLIENT_PORTAL, label: 'Client portail' },
    { value: TicketPortail.BACK_OFFICE_PORTAL, label: 'BackOfficePortail' },
    { value: TicketPortail.APPLICATION_PORTAL, label: 'Application portail' }
  ];

  readonly sizeOptions: { value: TicketSize; label: string }[] = [
    { value: TicketSize.S, label: 'S' },
    { value: TicketSize.M, label: 'M' },
    { value: TicketSize.L, label: 'L' }
  ];

  readonly priorityOptions = [1, 2, 3, 4, 5];

  readonly scopeSuggestions: string[] = ['Connexion', 'UI', 'Amélioration', 'Performance', 'Sécurité', 'Données'];

  page: PageResponse<Ticket> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true };
  loading = true;
  statusFilter = '';

  selected: Ticket | null = null;

  showModal = false;
  editMode = false;
  saving = false;
  error = '';
  /** Index de l'élément en cours d'édition dans page.content, pour la navigation précédent/suivant. -1 hors édition. */
  currentIndex = -1;

  current: {
    ticketRef?: string; label: string; description: string;
    type: TicketType | null; status: TicketStatus;
    portail: TicketPortail | null; scope: string; priority: number | null; size: TicketSize | null;
  } = { label: '', description: '', type: null, status: TicketStatus.OUVERT, portail: null, scope: '', priority: null, size: null };

  constructor(
    private api: ApiService,
    public authService: AuthService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.load(0);
  }

  get isAdmin(): boolean { return this.authService.hasRole(Role.ADMIN); }

  load(page: number): void {
    this.loading = true;
    this.selected = null;
    this.api.getTickets(page, 10, this.statusFilter).subscribe({
      next: p => { this.page = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onStatusFilter(value: string): void {
    this.statusFilter = value;
    this.load(0);
  }

  pages(): number[] {
    return Array.from({ length: this.page.totalPages }, (_, i) => i);
  }

  // Sélection simple (exclusive) d'une ligne via checkbox : un clic la sélectionne,
  // un second clic sur la même ligne la désélectionne. Pas de sélection multiple.
  selectRow(t: Ticket): void {
    this.selected = this.isSelected(t) ? null : t;
  }

  isSelected(t: Ticket): boolean {
    return this.selected?.ticketRef === t.ticketRef;
  }

  clearSelection(): void {
    this.selected = null;
  }

  statusClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.OUVERT:   return 'badge-status-ouvert';   // bleu
      case TicketStatus.EN_COURS: return 'badge-status-encours'; // jaune
      case TicketStatus.CLOTURE:  return 'badge-status-cloture'; // vert
      default: return '';
    }
  }

  statusLabel(status: TicketStatus): string {
    return this.statusOptions.find(o => o.value === status)?.label ?? status;
  }

  typeLabel(type: TicketType): string {
    return this.typeOptions.find(o => o.value === type)?.label ?? type;
  }

  portailLabel(portail: TicketPortail): string {
    return this.portailOptions.find(o => o.value === portail)?.label ?? portail;
  }

  sizeLabel(size: TicketSize): string {
    return this.sizeOptions.find(o => o.value === size)?.label ?? size;
  }

  /** Couleur dédiée par type de ticket (badge), pour distinguer visuellement Bug / Enhancement / Grosse Evolution / Technical. */
  typeClass(type: TicketType): string {
    switch (type) {
      case TicketType.BUG:             return 'badge-type-bug';
      case TicketType.ENHANCEMENT:      return 'badge-type-enhancement';
      case TicketType.GROSSE_EVOLUTION: return 'badge-type-evolution';
      case TicketType.TECHNICAL:        return 'badge-type-technical';
      default: return '';
    }
  }

  portailClass(portail: TicketPortail): string {
    switch (portail) {
      case TicketPortail.MANAGER_PORTAL:     return 'badge-portail-manager';
      case TicketPortail.ADMIN_PORTAL:       return 'badge-portail-admin';
      case TicketPortail.CLIENT_PORTAL:      return 'badge-portail-client';
      case TicketPortail.BACK_OFFICE_PORTAL: return 'badge-portail-backoffice';
      case TicketPortail.APPLICATION_PORTAL: return 'badge-portail-application';
      default: return '';
    }
  }

  sizeClass(size: TicketSize): string {
    switch (size) {
      case TicketSize.S: return 'badge-size-s';
      case TicketSize.M: return 'badge-size-m';
      case TicketSize.L: return 'badge-size-l';
      default: return '';
    }
  }

  openCreate(): void {
    this.error = '';
    this.editMode = false;
    this.currentIndex = -1;
    // Type, Portail et Size ne sont pas pré-sélectionnés : l'utilisateur doit choisir explicitement.
    this.current = { label: '', description: '', type: null, status: TicketStatus.OUVERT, portail: null, scope: '', priority: null, size: null };
    this.showModal = true;
  }

  openEdit(t: Ticket): void {
    this.error = '';
    this.editMode = true;
    this.currentIndex = this.page.content.findIndex(x => x.ticketRef === t.ticketRef);
    this.current = {
      ticketRef: t.ticketRef,
      label: t.label,
      description: t.description || '',
      type: t.type,
      status: t.status,
      portail: t.portail,
      scope: t.scope || '',
      priority: t.priority ?? null,
      size: t.size
    };
    this.showModal = true;
  }

  /** Navigation précédent/suivant en mode édition, dans la page actuellement chargée. */
  get hasPrevious(): boolean { return this.editMode && this.currentIndex > 0; }
  get hasNext(): boolean { return this.editMode && this.currentIndex >= 0 && this.currentIndex < this.page.content.length - 1; }

  showPrevious(): void {
    if (!this.hasPrevious) return;
    this.openEdit(this.page.content[this.currentIndex - 1]);
  }

  showNext(): void {
    if (!this.hasNext) return;
    this.openEdit(this.page.content[this.currentIndex + 1]);
  }

  canEdit(t: Ticket): boolean {
    return this.isAdmin || !!t.mine;
  }

  isFormValid(): boolean {
    return !!this.current.label?.trim() && !!this.current.type && !!this.current.portail && !!this.current.size;
  }

  save(): void {
    if (!this.isFormValid()) return;
    this.saving = true;
    this.error = '';
    const payload = {
      label: this.current.label.trim(),
      description: this.current.description?.trim() || undefined,
      type: this.current.type!,
      status: this.current.status,
      portail: this.current.portail!,
      scope: this.current.scope?.trim() || undefined,
      priority: this.current.priority ?? undefined,
      size: this.current.size!
    };
    const obs = this.editMode && this.current.ticketRef
      ? this.api.updateTicket(this.current.ticketRef, payload)
      : this.api.createTicket(payload);

    obs.subscribe({
      next: () => { this.saving = false; this.showModal = false; this.load(this.page.page); },
      error: (e) => { this.saving = false; this.error = e?.error?.message || 'Erreur lors de l\'enregistrement'; }
    });
  }

  async delete(t: Ticket): Promise<void> {
    const ok = await this.confirmDialog.open({
      title: 'Supprimer le ticket',
      message: `Voulez-vous vraiment supprimer le ticket ${t.ticketRef} ?`,
      type: 'danger',
      confirmLabel: 'Supprimer'
    });
    if (!ok) return;
    this.api.deleteTicket(t.ticketRef).subscribe({
      next: () => this.load(this.page.page),
      error: () => {}
    });
  }
}
