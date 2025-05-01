import { inject } from '@angular/core'; // inject fonksiyonunu import et
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // AuthService'i import et

// Fonksiyonel CanActivate Guard tanımı
export const authGuard: CanActivateFn = (route, state) => {
  // Gerekli servisleri inject fonksiyonu ile al
  const authService = inject(AuthService);
  const router = inject(Router);

  // AuthService'teki anlık giriş durumunu kontrol et
  if (authService.isLoggedIn) {
    // Eğer kullanıcı giriş yapmışsa, rotaya erişime izin ver
    return true;
  } else {
    // Eğer kullanıcı giriş yapmamışsa:
    console.log('AuthGuard: User not logged in, redirecting to login.');
    // Login sayfasına yönlendir (ve orijinal hedeflenen URL'i query param olarak ekleyebiliriz - opsiyonel)
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    // Rotaya erişimi engelle
    return false;
  }
};
