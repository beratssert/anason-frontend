import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SellerRoutingModule } from './seller-routing.module';
import { SellerComponent } from './seller.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { EditProductComponent } from './pages/edit-product/edit-product.component';

@NgModule({
  declarations: [
    SellerComponent,
    SellerDashboardComponent,
    MyProductsComponent,
    ProductFormComponent,
    AddProductComponent,
    EditProductComponent,
  ],
  imports: [CommonModule, SellerRoutingModule, ReactiveFormsModule],
})
export class SellerModule {}
