import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Permet à n'importe quel composant qui vient de marquer un message comme lu
 * (ou d'en envoyer un) de prévenir immédiatement la navbar, plutôt que
 * d'attendre son prochain cycle de polling (45s, cf. NavbarComponent) pour
 * rafraîchir le compteur de notifications non lues.
 */
@Injectable({ providedIn: 'root' })
export class EmNotificationService {
  private changedSubject = new Subject<void>();
  readonly changed$ = this.changedSubject.asObservable();

  /** À appeler après toute action qui change le nombre de messages non lus (lecture, envoi...). */
  notifyChanged(): void {
    this.changedSubject.next();
  }
}
