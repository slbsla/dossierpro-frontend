import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { UserInfo, DashboardEm, EmManagerInfo } from '../../../core/models/models';

@Component({ selector: 'app-em-info', templateUrl: './em-info.component.html' })
export class EmInfoComponent implements OnInit {
  user: UserInfo | null = null;
  dashboard: DashboardEm | null = null;
  safeMapUrl: SafeResourceUrl | null = null;
  mapLoading = false;
  managers: EmManagerInfo[] = [];
  managersLoading = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  /** Vrai Entity Manager : voit toute l'équipe. Auditor/Signataire : voit seulement lui-même + son EM. */
  get canManageUsers(): boolean { return this.auth.canManageUsers; }

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.api.getEmDashboard().subscribe(d => {
      this.dashboard = d;
      if (d.entityAdresse) this.geocodeAddress(d.entityAdresse);
    });
    this.managersLoading = true;
    this.api.getEmManagers().subscribe({
      next: ms => { this.managers = ms; this.managersLoading = false; },
      error: () => this.managersLoading = false
    });
  }

  get osmSearchUrl(): string {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(this.dashboard?.entityAdresse || '')}`;
  }

  private geocodeAddress(adresse: string) {
    this.mapLoading = true;
    const q = encodeURIComponent(adresse);
    // api-adresse.data.gouv.fr — API officielle française, pas de clé requise
    this.http.get<any>(`https://api-adresse.data.gouv.fr/search/?q=${q}&limit=1`)
      .subscribe({
        next: res => {
          this.mapLoading = false;
          const feature = res?.features?.[0];
          if (!feature) return;
          const [lon, lat] = feature.geometry.coordinates;
          const delta = 0.004;
          const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
          const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
          this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        },
        error: () => { this.mapLoading = false; }
      });
  }
}
