import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'public',
    loadChildren: () =>
      import('./features/public/public.module').then((m) => m.PublicModule),
  },
  { path: '', redirectTo: '/public', pathMatch: 'full' },
  { path: 'products', loadChildren: () => import('./features/product/product.module').then(m => m.ProductModule) },
  { path: 'cart', loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
