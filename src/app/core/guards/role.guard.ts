import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, User } from '../services/auth.service'; // User tipini de import ediyoruz
import { ToastrService } from 'ngx-toastr';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Kullanıcı giriş yapmış mı kontrolü (AuthGuard'ın da çalıştığı varsayılıyor)
  if (!authService.isLoggedIn) {
    // Normalde AuthGuard yönlendirecektir, bu ek bir önlem
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Rotadan beklenen rolleri al
  const expectedRoles = route.data['roles'] as Array<User['role']>;

  // Rota için özel rol tanımlanmamışsa geçişe izin ver (sadece login yeterli)
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  // Kullanıcının mevcut rolünü al
  const userRole = authService.getUserRole();

  // Kullanıcının rolü beklenen rollerden biri mi kontrol et
  if (userRole && expectedRoles.includes(userRole as User['role'])) {
    // Rol uygunsa geçişe izin ver
    return true;
  } else {
    // Rol uygun değilse erişimi engelle, bildirim göster ve ana sayfaya yönlendir
    console.warn(
      `RoleGuard: Access denied. User role "${userRole}" does not match expected roles "${expectedRoles.join(
        ', '
      )}".`
    );
    toastr.error(
      'You do not have permission to access this page.',
      'Access Denied'
    );
    router.navigate(['/']);
    return false;
  }
};
