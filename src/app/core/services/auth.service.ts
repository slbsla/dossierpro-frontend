import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserInfo, Role } from '../models/models';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api';
  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const saved = sessionStorage.getItem('dp_user');
    if (saved) this.userSubject.next(JSON.parse(saved));
  }

  login(username: string, password: string): Observable<UserInfo> {
    const creds = btoa(`${username}:${password}`);
    sessionStorage.setItem('dp_creds', creds);
    const headers = new HttpHeaders({ Authorization: `Basic ${creds}` });
    return this.http.get<UserInfo>(`${this.API}/auth/me`, { headers }).pipe(
      tap(user => {
        this.userSubject.next(user);
        sessionStorage.setItem('dp_user', JSON.stringify(user));
      })
    );
  }

  logout() {
    sessionStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.API}/auth/change-password`, { currentPassword, newPassword }).pipe(
      tap(() => {
        // Marquer isFirstConnexion = false dans la session locale
        const user = this.userSubject.value;
        if (user) {
          const updated = { ...user, isFirstConnexion: false };
          this.userSubject.next(updated);
          sessionStorage.setItem('dp_user', JSON.stringify(updated));
        }
      })
    );
  }

  get currentUser(): UserInfo | null { return this.userSubject.value; }
  get credentials(): string | null { return sessionStorage.getItem('dp_creds'); }
  isLoggedIn(): boolean { return this.userSubject.value !== null; }
  hasRole(role: Role): boolean { return this.userSubject.value?.role === role; }

  // ── Capacités par rôle de manager (Entity Manager / Entity Auditor / Entity Signataire) ──
  get managerRoleName(): string | null { return this.userSubject.value?.roleName ?? null; }
  get isAuditor(): boolean { return this.managerRoleName === 'Entity Auditor'; }
  get isSignataire(): boolean { return this.managerRoleName === 'Entity Signataire'; }
  /** Gestion des utilisateurs (création/modification/suppression/activation, groupes) : Entity Manager uniquement. */
  get canManageUsers(): boolean { return !this.isAuditor && !this.isSignataire; }
  /** Traiter un dossier en attente (valider/rejeter) ou l'archiver : Entity Manager + Entity Signataire. */
  get canProcessDossiers(): boolean { return !this.isAuditor; }
  /** Activités récentes du dashboard : Entity Manager uniquement. */
  get canViewRecentActivity(): boolean { return !this.isAuditor && !this.isSignataire; }
  /** Un manager non-Entity Manager ne gère qu'une seule entité (pas de switch d'entité). */
  get canSwitchEntity(): boolean { return this.managerRoleName === 'Entity Manager'; }

  getHomeRoute(): string {
    switch (this.currentUser?.role) {
      case Role.ADMIN: return '/admin/dashboard';
      case Role.ENTITY_MANAGER: return '/em/dashboard';
      case Role.USER: return '/user/dossiers';
      default: return '/login';
    }
  }
}
