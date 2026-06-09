import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogService, ConfirmConfig } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  visible = false;
  config: ConfirmConfig = { title: '', message: '' };
  private resolve!: (value: boolean) => void;
  private sub!: Subscription;

  constructor(private svc: ConfirmDialogService) {}

  ngOnInit() {
    this.sub = this.svc.request$.subscribe(req => {
      if (!req) return;
      this.config = req.config;
      this.resolve = req.resolve;
      this.visible = true;
    });
  }

  confirm() { this.visible = false; this.resolve(true); }
  cancel()  { this.visible = false; this.resolve(false); }

  get icon(): string {
    switch (this.config.type) {
      case 'danger':  return 'delete_forever';
      case 'warning': return 'warning_amber';
      default:        return 'help_outline';
    }
  }

  get confirmClass(): string {
    switch (this.config.type) {
      case 'danger':  return 'btn btn-danger';
      case 'warning': return 'btn btn-warning';
      default:        return 'btn btn-primary';
    }
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
