// src/app/features/seller/seller-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component'; // Import et

const routes: Routes = [
  { path: '', component: SellerDashboardComponent },
  // İleride satıcı alt rotaları buraya eklenecek (örn: path: 'my-products')
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellerRoutingModule {}
