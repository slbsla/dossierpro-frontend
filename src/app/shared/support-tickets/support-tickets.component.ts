import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';
import { PageResponse, Role, Ticket, TicketStatus, TicketType } from '../../core/models/models';

@Component({
  selector: 'app-support-tickets',
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.css']
})
export class SupportTicketsComponent implements OnInit {

  Role = Role;
  TicketType = TicketType;
  TicketStatus = TicketStatus;

  readonly typeOptions: { value: TicketType; label: string }[] = [
    { value: TicketType.BUG, label: 'Bug' },
    { value: TicketType.ENHANCEMENT, label: 'Enhancement' },
    { value: TicketType.GROSSE_EVOLUTION, label: 'Grosse Evolution' }
  ];

  readonly statusOptions: { value: TicketStatus; label: string }[] = [
    { value: TicketStatus.OUVERT, label: 'Ouvert' },
    { value: TicketStatus.EN_COURS, label: 'En cours' },
    { value: TicketStatus.CLOTURE, label: 'Clôturé' }
  ];

  page: PageResponse<Ticket> = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true };
  loading = true;
  statusFilter = '';

  selected: Ticket | null = null;

  showModal = false;
  editMode = false;
  saving = false;
  error = '';
  current: { ticketRef?: string; label: string; description: string; type: TicketType | null; status: TicketStatus } =
    { label: '', description: '', type: null, status: TicketStatus.OUVERT };

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

  openCreate(): void {
    this.error = '';
    this.editMode = false;
    this.current = { label: '', description: '', type: TicketType.BUG, status: TicketStatus.OUVERT };
    this.showModal = true;
  }

  openEdit(t: Ticket): void {
    this.error = '';
    this.editMode = true;
    this.current = {
      ticketRef: t.ticketRef,
      label: t.label,
      description: t.description || '',
      type: t.type,
      status: t.status
    };
    this.showModal = true;
  }

  canEdit(t: Ticket): boolean {
    return this.isAdmin || !!t.mine;
  }

  save(): void {
    if (!this.current.label?.trim() || !this.current.type) return;
    this.saving = true;
    this.error = '';
    const payload = {
      label: this.current.label.trim(),
      description: this.current.description?.trim() || undefined,
      type: this.current.type,
      status: this.current.status
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
