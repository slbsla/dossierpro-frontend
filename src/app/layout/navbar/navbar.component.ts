import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { EmSessionService } from '../../core/services/em-session.service';
import { ApiService } from '../../core/services/api.service';
import { EmSupportMessage, Role } from '../../core/models/models';

/** Intervalle de scrutation (polling) des notifications de messagerie EM, en ms. */
const NOTIF_POLL_INTERVAL_MS = 45000;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() title = 'DossierPro';
  Role = Role;
  role: Role | null = null;
  managerRoleName: string | null = null;

  // ── Notifications (messagerie EM <-> client) ──
  unreadCount = 0;
  unreadMessages: EmSupportMessage[] = [];
  notifOpen = false;
  private pollSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    public emSession: EmSessionService,
    private api: ApiService,
    private router: Router,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(u => {
      this.role = u?.role ?? null;
      this.managerRoleName = u?.roleName ?? null;
      this.setupNotifPolling();
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.notifOpen = false;
    }
  }

  /** Le bandeau de notifications est dédié à la messagerie client : ADMIN n'est pas concerné. */
  get showNotifBell(): boolean {
    return this.role === Role.ENTITY_MANAGER;
  }

  private setupNotifPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
    if (!this.showNotifBell) return;

    this.pollSub = interval(NOTIF_POLL_INTERVAL_MS).pipe(
      startWith(0),
      switchMap(() => this.api.getEmSupportUnreadCount())
    ).subscribe({
      next: res => this.unreadCount = res.count,
      error: () => {}
    });
  }

  toggleNotif(): void {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) {
      this.api.getEmSupportUnread().subscribe({
        next: msgs => this.unreadMessages = msgs,
        error: () => this.unreadMessages = []
      });
    }
  }

  closeNotif(): void {
    this.notifOpen = false;
  }

  goToMessage(): void {
    this.closeNotif();
    this.router.navigate(['/em/messages']);
  }

  /**
   * Seul un manager ayant le rôle "Entity Manager" peut gérer plusieurs entités
   * et donc changer d'entité. Les autres rôles (Entity Auditor, Entity Signataire)
   * ne travaillent qu'au sein d'une seule entité : le bouton est désactivé.
   */
  get canSwitchEntity(): boolean {
    return this.managerRoleName === 'Entity Manager';
  }

  changeEntity(): void {
    if (!this.canSwitchEntity) return;
    this.emSession.clear();
  }
}
