import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';

const routes: Routes = [
  { path: '', component: OrderHistoryComponent },
  {
    path: ':orderId', // /orders/1001 -> Sipariş Detayı
    component: OrderDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
