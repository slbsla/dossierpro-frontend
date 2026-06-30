import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmSupportMessage, EmSupportRecipient } from '../../../core/models/models';

@Component({
  selector: 'app-em-messages',
  templateUrl: './em-messages.component.html',
  styleUrls: ['./em-messages.component.css']
})
export class EmMessagesComponent implements OnInit {

  activeTab: 'received' | 'sent' = 'received';

  received: EmSupportMessage[] = [];
  sent: EmSupportMessage[] = [];
  loadingReceived = false;
  loadingSent = false;

  // ── Détail (lecture) ──
  showViewModal = false;
  viewMessage: EmSupportMessage | null = null;

  // ── Réponse à un message reçu ──
  showReplyModal = false;
  replyTarget: EmSupportMessage | null = null;
  replyMessage = '';
  replyAttachment1: File | null = null;
  replySubmitting = false;
  replyError = '';

  // ── Nouveau message ──
  showNewModal = false;
  recipients: EmSupportRecipient[] = [];
  recipientsLoading = false;
  newRecipientReference = '';
  newSubject = '';
  newDossierReference = '';
  newMessage = '';
  newAttachment1: File | null = null;
  newSubmitting = false;
  newError = '';

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadReceived();
    this.loadSent();
  }

  get myReference(): string {
    return this.auth.currentUser?.uniqueReference ?? '';
  }

  // ── Chargement des listes ──
  loadReceived(): void {
    this.loadingReceived = true;
    this.api.getEmSupportReceived().subscribe({
      next: msgs => { this.received = msgs; this.loadingReceived = false; },
      error: () => this.loadingReceived = false
    });
  }

  loadSent(): void {
    this.loadingSent = true;
    this.api.getEmSupportSent().subscribe({
      next: msgs => { this.sent = msgs; this.loadingSent = false; },
      error: () => this.loadingSent = false
    });
  }

  switchTab(tab: 'received' | 'sent'): void {
    this.activeTab = tab;
  }

  // ── Voir un message (marque comme lu côté serveur) ──
  view(m: EmSupportMessage): void {
    this.api.getEmSupportMessage(m.reference).subscribe({
      next: full => {
        this.viewMessage = full;
        this.showViewModal = true;
        // Met à jour l'état "lu" localement sans recharger toute la liste
        if (!m.read) {
          m.read = true;
        }
      }
    });
  }

  closeView(): void {
    this.showViewModal = false;
    this.viewMessage = null;
  }

  downloadAttachment(ref: string, slot: 1 | 2): void {
    window.open(this.api.getEmSupportAttachmentUrl(ref, slot), '_blank');
  }

  // ── Répondre ──
  openReply(m: EmSupportMessage): void {
    if (m.hasReply) return;
    this.replyTarget = m;
    this.replyMessage = '';
    this.replyAttachment1 = null;
    this.replyError = '';
    this.showReplyModal = true;
  }

  closeReply(): void {
    this.showReplyModal = false;
    this.replyTarget = null;
  }

  get replySubjectPreview(): string {
    return this.replyTarget ? `[RE] ${this.replyTarget.subject}` : '';
  }

  onReplyFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    this.replyAttachment1 = file;
  }

  get replyInvalid(): boolean {
    return !this.replyMessage.trim() || this.replySubmitting;
  }

  submitReply(): void {
    if (!this.replyTarget || this.replyInvalid) return;
    this.replySubmitting = true;
    this.replyError = '';
    this.api.replyEmSupportMessage(this.replyTarget.reference, {
      message: this.replyMessage.trim(),
      attachment1: this.replyAttachment1
    }).subscribe({
      next: () => {
        this.replySubmitting = false;
        this.showReplyModal = false;
        if (this.replyTarget) this.replyTarget.hasReply = true;
        this.loadSent();
        this.loadReceived();
      },
      error: e => {
        this.replySubmitting = false;
        this.replyError = e?.error?.message || 'Erreur lors de l\'envoi de la réponse';
      }
    });
  }

  // ── Nouveau message ──
  openNew(): void {
    this.newRecipientReference = '';
    this.newSubject = '';
    this.newDossierReference = '';
    this.newMessage = '';
    this.newAttachment1 = null;
    this.newError = '';
    this.showNewModal = true;
    this.loadRecipients();
  }

  closeNew(): void {
    this.showNewModal = false;
  }

  private loadRecipients(): void {
    this.recipientsLoading = true;
    this.api.getEmSupportRecipients().subscribe({
      next: r => { this.recipients = r; this.recipientsLoading = false; },
      error: () => this.recipientsLoading = false
    });
  }

  onNewFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    this.newAttachment1 = file;
  }

  get newInvalid(): boolean {
    return !this.newRecipientReference || !this.newSubject.trim() || !this.newMessage.trim() || this.newSubmitting;
  }

  submitNew(): void {
    if (this.newInvalid) return;
    this.newSubmitting = true;
    this.newError = '';
    this.api.sendEmSupportMessage({
      recipientReference: this.newRecipientReference,
      subject: this.newSubject.trim(),
      dossierReference: this.newDossierReference.trim() || undefined,
      message: this.newMessage.trim(),
      attachment1: this.newAttachment1
    }).subscribe({
      next: () => {
        this.newSubmitting = false;
        this.showNewModal = false;
        this.activeTab = 'sent';
        this.loadSent();
      },
      error: e => {
        this.newSubmitting = false;
        this.newError = e?.error?.message || 'Erreur lors de l\'envoi du message';
      }
    });
  }
}
