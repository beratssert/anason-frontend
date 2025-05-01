import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; // AuthGuard'ı import et

const routes: Routes = [
  // Mevcut Auth ve Public rotaları (genellikle korunmaz)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'products', // Public ürün rotaları (genellikle korunmaz)
    loadChildren: () =>
      import('./features/product/product.module').then((m) => m.ProductModule),
  },

  // Korumalı Rotalar
  {
    path: 'cart',
    loadChildren: () =>
      import('./features/cart/cart.module').then((m) => m.CartModule),
    canActivate: [authGuard], // Cart sayfasını koru
  },
  // {
  //   path: 'profile',
  //   loadChildren: () =>
  //     import('./features/profile/profile.module').then((m) => m.ProfileModule), // Henüz oluşturulmadı
  //   canActivate: [authGuard], // Profile sayfasını koru
  // },
  // {
  //   path: 'checkout',
  //   loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule), // Henüz oluşturulmadı
  //   canActivate: [authGuard] // Checkout sayfasını koru
  // },
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule), // Henüz oluşturulmadı
  //   canActivate: [authGuard, /* AdminRoleGuard */] // Hem giriş hem rol kontrolü gerekir
  // },
  // {
  //   path: 'seller',
  //   loadChildren: () => import('./features/seller/seller.module').then(m => m.SellerModule), // Henüz oluşturulmadı
  //   canActivate: [authGuard, /* SellerRoleGuard */] // Hem giriş hem rol kontrolü gerekir
  // },

  // Varsayılan Rota (genellikle public bir sayfaya veya ürünlere yönlendirir)
  {
    path: '',
    redirectTo: '/products', // Ana sayfayı ürünler listesine yönlendir (veya başka bir public sayfaya)
    pathMatch: 'full',
  },

  // Eşleşmeyen Rotalar (404 Sayfası - Opsiyonel)
  // { path: '**', component: NotFoundComponent } // NotFoundComponent oluşturulmalı
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
