import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  // Public / Auth Routes
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'products', // Ürünler public
    loadChildren: () =>
      import('./features/product/product.module').then((m) => m.ProductModule),
  },

  // Authenticated Routes (Login Required)
  {
    path: 'cart',
    loadChildren: () =>
      import('./features/cart/cart.module').then((m) => m.CartModule),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/order/order.module').then((m) => m.OrderModule),
    canActivate: [authGuard],
  },
  // { // Checkout şimdilik ertelendi
  //   path: 'checkout',
  //   loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule),
  //   canActivate: [authGuard]
  // },

  // Role Protected Routes
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'seller',
    loadChildren: () =>
      import('./features/seller/seller.module').then((m) => m.SellerModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SELLER', 'ADMIN'] },
  },

  // Default & Wildcard Routes
  {
    path: '',
    redirectTo: '/products', // Ana sayfa ürünlere yönlendirir
    pathMatch: 'full',
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./features/checkout/checkout.module').then(
        (m) => m.CheckoutModule
      ),
    canActivate: [authGuard],
  },
  // { path: '**', component: NotFoundComponent } // 404 sayfası eklenebilir
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Opsiyonel: Sayfa yenilemede scroll pozisyonunu başa al
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
