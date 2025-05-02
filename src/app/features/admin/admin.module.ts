import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { AdminProductManagementComponent } from './pages/admin-product-management/admin-product-management.component';
import { AdminOrderManagementComponent } from './pages/admin-order-management/admin-order-management.component';


@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    UserManagementComponent,
    AdminProductManagementComponent,
    AdminOrderManagementComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
