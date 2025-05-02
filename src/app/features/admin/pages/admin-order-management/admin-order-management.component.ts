// src/app/features/admin/pages/admin-order-management.component.ts
import { Component, OnInit } from '@angular/core';
import {
  OrderService,
  Order,
  OrderStatus,
} from '../../../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-order-management',
  templateUrl: './admin-order-management.component.html',
  styleUrls: ['./admin-order-management.component.css'],
  standalone: false,
})
export class AdminOrderManagementComponent implements OnInit {
  allOrders: Order[] = [];
  isLoading: boolean = true;
  updatingOrderId: number | null = null;
  possibleStatuses: OrderStatus[]; // Durumları select için tut

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {
    this.possibleStatuses = this.orderService.orderStatuses; // Servisten olası durumları al
  }

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.allOrders = data.map((o) => ({
          ...o,
          created_at: new Date(o.created_at),
        })); // Tarihleri çevir
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading all orders:', err);
        this.toastr.error('Failed to load orders.', 'Error');
        this.isLoading = false;
      },
    });
  }

  // Durum değişikliğini yöneten metot
  onStatusChange(order: Order, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as OrderStatus;

    if (!newStatus || newStatus === order.status) return; // Değişiklik yoksa çık

    this.updatingOrderId = order.id; // Güncelleniyor olarak işaretle

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        if (updatedOrder) {
          // Listedeki siparişi güncelle
          const index = this.allOrders.findIndex(
            (o) => o.id === updatedOrder.id
          );
          if (index > -1) {
            this.allOrders[index].status = updatedOrder.status;
          }
          this.toastr.success(
            `Order #${order.id} status updated to ${newStatus}.`,
            'Success'
          );
        } else {
          this.toastr.error(
            `Failed to update status for order #${order.id}. Order not found.`,
            'Error'
          );
          // Başarısız olursa select'i eski değere döndürebiliriz
          selectElement.value = order.status;
        }
        this.updatingOrderId = null; // İşlem bitti
      },
      error: (err) => {
        console.error(`Error updating order status for ${order.id}:`, err);
        this.toastr.error(
          `Failed to update status for order #${order.id}.`,
          'Error'
        );
        selectElement.value = order.status; // Hatada eski değere döndür
        this.updatingOrderId = null; // İşlem bitti (hata ile)
      },
    });
  }

  // Sipariş detaylarını göstermek için (ileride)
  viewOrderDetails(orderId: number): void {
    this.toastr.info(
      `Maps to order details for ID: ${orderId} (not implemented yet)`
    );
    // this.router.navigate(['/admin/orders', orderId]);
  }
}
