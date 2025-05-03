import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { EditProductComponent } from './pages/edit-product/edit-product.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { SellerOrderManagementComponent } from './pages/seller-order-management/seller-order-management.component';
import { SellerOrderDetailComponent } from './pages/seller-order-detail/seller-order-detail.component';
import { SellerReturnManagementComponent } from './pages/seller-return-management/seller-return-management.component';
import { SellerProfileComponent } from './pages/seller-profile/seller-profile.component';

const routes: Routes = [
  {
    path: '',
    component: SellerDashboardComponent,
  },
  {
    path: 'my-products',
    component: MyProductsComponent,
  },
  {
    path: 'add-product',
    component: AddProductComponent,
  },
  {
    path: 'edit-product/:id',
    component: EditProductComponent,
  },
  { path: 'my-orders', component: SellerOrderManagementComponent },
  { path: 'my-orders/:orderId', component: SellerOrderDetailComponent },
  { path: 'returns', component: SellerReturnManagementComponent },
  { path: 'profile', component: SellerProfileComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellerRoutingModule {}
