import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { PhonePipe } from './pipes/phone.pipe';
import { PhoneFormatDirective } from './directives/phone-format.directive';

@NgModule({
  declarations: [ConfirmDialogComponent, PhonePipe, PhoneFormatDirective],
  imports: [CommonModule],
  exports: [ConfirmDialogComponent, PhonePipe, PhoneFormatDirective]
})
export class SharedModule {}
