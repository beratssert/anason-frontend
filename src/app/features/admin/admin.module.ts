import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { AdminProductManagementComponent } from './pages/admin-product-management/admin-product-management.component';
import { AdminOrderManagementComponent } from './pages/admin-order-management/admin-order-management.component';
import { AdminComplaintManagementComponent } from './pages/admin-complaint-management/admin-complaint-management.component';
import { AdminComplaintDetailComponent } from './pages/admin-complaint-detail/admin-complaint-detail.component';

@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    UserManagementComponent,
    AdminProductManagementComponent,
    AdminOrderManagementComponent,
    AdminComplaintManagementComponent,
    AdminComplaintDetailComponent,
  ],
  imports: [CommonModule, AdminRoutingModule, FormsModule, ReactiveFormsModule],
})
export class AdminModule {}
