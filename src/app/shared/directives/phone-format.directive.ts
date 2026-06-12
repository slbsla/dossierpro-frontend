import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Applique sur un <input> : formate automatiquement en "XX XX XX XX XX".
 *  La valeur stockée dans le FormControl contient les espaces. */
@Directive({ selector: 'input[appPhoneFormat]' })
export class PhoneFormatDirective {

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() @Self() private control: NgControl
  ) {}

  @HostListener('input')
  onInput(): void {
    this.format();
  }

  @HostListener('blur')
  onBlur(): void {
    this.format();
  }

  private format(): void {
    const raw = this.el.nativeElement.value;
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    const formatted = digits.match(/.{1,2}/g)?.join(' ') ?? '';
    this.el.nativeElement.value = formatted;
    if (this.control?.control) {
      this.control.control.setValue(formatted, { emitEvent: false });
    }
  }
}
