// src/app/core/interceptors/auth.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment'; // API URL kontrolü için

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const isApiUrl = req.url.startsWith(this.apiUrl); // Sadece kendi API'mize token ekle

    // Token varsa ve API isteğiyse (login/register hariç tutulabilir ama genellikle backend /api/users altında olmadığı için gerek kalmaz)
    if (token && isApiUrl) {
      // İsteği klonla ve Authorization başlığını ekle
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      // console.log('AuthInterceptor: Adding token to request for', req.url);
      return next.handle(clonedReq);
    } else {
      // Token yoksa veya API isteği değilse, orijinal isteği gönder
      return next.handle(req);
    }
  }
}
