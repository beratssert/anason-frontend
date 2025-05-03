import { NgModule } from '@angular/core';

import { SellerRoutingModule } from './seller-routing.module';
import { SellerComponent } from './seller.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { EditProductComponent } from './pages/edit-product/edit-product.component';
import { SellerOrderManagementComponent } from './pages/seller-order-management/seller-order-management.component';
import { SellerOrderDetailComponent } from './pages/seller-order-detail/seller-order-detail.component';
import { SharedModule } from '../../shared/shared.module';
import { SellerReturnManagementComponent } from './pages/seller-return-management/seller-return-management.component';
import { SellerProfileComponent } from './pages/seller-profile/seller-profile.component';

@NgModule({
  declarations: [
    SellerComponent,
    SellerDashboardComponent,
    MyProductsComponent,
    AddProductComponent,
    EditProductComponent,
    SellerOrderManagementComponent,
    SellerOrderDetailComponent,
    SellerReturnManagementComponent,
    SellerProfileComponent,
  ],
  imports: [SellerRoutingModule, SharedModule],
})
export class SellerModule {}
