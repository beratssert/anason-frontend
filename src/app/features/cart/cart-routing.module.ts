import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartViewComponent } from './pages/cart-view/cart-view.component'; // Import et

const routes: Routes = [
  { path: '', component: CartViewComponent }, // /cart yolu CartViewComponent'i gösterecek
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartRoutingModule {}
