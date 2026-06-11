import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SupportMessage } from '../../../core/models/models';

@Component({
  selector: 'app-user-support',
  templateUrl: './user-support.component.html',
  styleUrls: ['./user-support.component.css']
})
export class UserSupportComponent implements OnInit {

  messages: SupportMessage[] = [];
  listLoading = true;

  // Contact modal
  showContactModal = false;
  form!: FormGroup;
  submitting = false;
  sendError = '';
  sendSuccess = false;
  userEmail: string | null = null;
  emailLoading = true;

  // View modal
  showViewModal = false;
  viewMessage: SupportMessage | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadMessages();
    this.loadUserEmail();
  }

  private loadMessages(): void {
    this.listLoading = true;
    this.api.getSupportMessages().subscribe({
      next: msgs => { this.messages = msgs; this.listLoading = false; },
      error: () => this.listLoading = false
    });
  }

  private loadUserEmail(): void {
    this.api.getUserProfile().subscribe({
      next: u => { this.userEmail = u.email || null; this.emailLoading = false; },
      error: () => this.emailLoading = false
    });
  }

  openContactModal(): void {
    this.sendError = '';
    this.sendSuccess = false;
    this.form = this.fb.group({
      subject: ['', [Validators.required, Validators.maxLength(120)]],
      email:   [{ value: this.userEmail || '', disabled: true }],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
    this.showContactModal = true;
  }

  get hasEmail(): boolean { return !!this.userEmail; }
  get emailCtrl() { return this.form.get('email')!; }
  get subjectCtrl() { return this.form.get('subject')!; }
  get messageCtrl() { return this.form.get('message')!; }
  get formInvalid(): boolean {
    return this.subjectCtrl.invalid || this.messageCtrl.invalid || !this.hasEmail;
  }

  send(): void {
    if (this.formInvalid || this.submitting) return;
    this.submitting = true;
    this.sendError = '';
    const payload = {
      subject: this.subjectCtrl.value,
      email:   this.userEmail!,
      message: this.messageCtrl.value
    };
    this.api.sendSupportMessage(payload).subscribe({
      next: (msg) => {
        this.messages.unshift(msg);
        this.sendSuccess = true;
        this.submitting = false;
        setTimeout(() => { this.showContactModal = false; this.sendSuccess = false; }, 1500);
      },
      error: (e) => {
        this.sendError = e?.error?.message || 'Erreur lors de l\'envoi';
        this.submitting = false;
      }
    });
  }

  viewMsg(ref: string): void {
    this.api.getSupportMessage(ref).subscribe({
      next: msg => { this.viewMessage = msg; this.showViewModal = true; }
    });
  }
}
