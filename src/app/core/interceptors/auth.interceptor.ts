import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const creds = this.authService.credentials;
    if (creds) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Basic ${creds}` }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
