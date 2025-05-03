import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { AdminProductManagementComponent } from './pages/admin-product-management/admin-product-management.component';
import { AdminOrderManagementComponent } from './pages/admin-order-management/admin-order-management.component';
import { AdminComplaintManagementComponent } from './pages/admin-complaint-management/admin-complaint-management.component';
import { AdminComplaintDetailComponent } from './pages/admin-complaint-detail/admin-complaint-detail.component';
import { AdminEditProductComponent } from './pages/admin-edit-product/admin-edit-product.component';
import { AdminOrderDetailComponent } from './pages/admin-order-detail/admin-order-detail.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  {
    path: 'users',
    component: UserManagementComponent,
  },
  { path: 'products', component: AdminProductManagementComponent },
  { path: 'products/:productId/edit', component: AdminEditProductComponent },
  { path: 'orders', component: AdminOrderManagementComponent },
  { path: 'orders/:orderId', component: AdminOrderDetailComponent },
  { path: 'complaints', component: AdminComplaintManagementComponent },
  { path: 'complaints/:complaintId', component: AdminComplaintDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
