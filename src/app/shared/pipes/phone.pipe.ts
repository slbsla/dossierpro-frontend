import { Pipe, PipeTransform } from '@angular/core';

/** Formate un numéro de téléphone en "XX XX XX XX XX".
 *  Accepte avec ou sans espaces en entrée. */
@Pipe({ name: 'phone' })
export class PhonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    const digits = value.replace(/\D/g, '');
    if (!digits) return value;
    // Groupes de 2 chiffres
    return digits.match(/.{1,2}/g)?.join(' ') ?? value;
  }
}
