import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../../core/services/auth.service';
import { OrderService, Order } from '../../../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-seller-order-management',
  templateUrl: './seller-order-management.component.html',
  styleUrls: ['./seller-order-management.component.css'],
  standalone: false,
})
export class SellerOrderManagementComponent implements OnInit {
  myOrders: Order[] = [];
  isLoading: boolean = true;
  currentSeller: User | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    // Guard zaten rolü kontrol ediyor ama burada da kontrol etmek iyi olabilir
    if (
      this.currentSeller &&
      (this.currentSeller.role === 'SELLER' ||
        this.currentSeller.role === 'ADMIN')
    ) {
      this.loadSellerOrders(this.currentSeller.id);
    } else {
      this.toastr.error(
        'You do not have permission to view this page.',
        'Unauthorized'
      );
      this.isLoading = false;
      // Opsiyonel: Ana sayfaya yönlendirilebilir
    }
  }

  loadSellerOrders(sellerId: number): void {
    this.isLoading = true;
    this.orderService.getOrdersBySellerId(sellerId).subscribe({
      next: (data) => {
        // Tarihleri Date objesine çevir
        this.myOrders = data.map((o) => ({
          ...o,
          created_at: new Date(o.created_at),
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading seller orders:', err);
        this.toastr.error('Failed to load your orders.', 'Error');
        this.isLoading = false;
      },
    });
  }

  // Sadece bu satıcıya ait ürünleri filtrelemek için yardımcı fonksiyon (opsiyonel)
  getSellerItems(order: Order): any[] {
    if (!this.currentSeller) return [];
    return order.items.filter(
      (item) => item.seller_id === this.currentSeller!.id
    );
  }

  // Sipariş durumunu güncelleme (Seller için - Opsiyonel)
  updateStatus(orderId: number, newStatus: Order['status']): void {
    // TODO: Seller'ın hangi durumları değiştirebileceği kontrol edilmeli
    // Örneğin sadece PROCESSING -> SHIPPED gibi
    this.toastr.info(
      `Status update for order ${orderId} to ${newStatus} (not implemented yet for seller).`
    );
    // this.orderService.updateOrderStatusBySeller(orderId, newStatus, this.currentSeller.id).subscribe(...)
  }

  // Sipariş detaylarını gösterme (ileride)
  viewOrderDetails(orderId: number): void {
    this.toastr.info(
      `Maps to order details for ID: ${orderId} (not implemented yet)`
    );
    // this.router.navigate(['/seller/orders', orderId]); // Farklı bir detay sayfası olabilir
  }
}
