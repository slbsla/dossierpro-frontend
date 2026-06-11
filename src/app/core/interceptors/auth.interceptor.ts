import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { EmSessionService } from '../services/em-session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private emSession: EmSessionService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const creds = this.authService.credentials;
    if (!creds) return next.handle(req);

    const headers: Record<string, string> = { Authorization: `Basic ${creds}` };

    // Attach entity code for all EM API calls when an entity is selected
    if (req.url.includes('/api/em/') && this.emSession.code) {
      headers['X-Entity-Code'] = this.emSession.code;
    }

    return next.handle(req.clone({ setHeaders: headers }));
  }
}
