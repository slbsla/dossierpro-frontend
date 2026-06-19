import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '../layout/layout.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { PhonePipe } from './pipes/phone.pipe';
import { PhoneFormatDirective } from './directives/phone-format.directive';
import { SupportTicketsComponent } from './support-tickets/support-tickets.component';

@NgModule({
  declarations: [ConfirmDialogComponent, PhonePipe, PhoneFormatDirective, SupportTicketsComponent],
  imports: [CommonModule, FormsModule, LayoutModule],
  exports: [ConfirmDialogComponent, PhonePipe, PhoneFormatDirective, SupportTicketsComponent]
})
export class SharedModule {}
