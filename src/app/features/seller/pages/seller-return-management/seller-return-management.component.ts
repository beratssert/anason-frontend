import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../../core/services/auth.service';
import { OrderService, Order } from '../../../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-return-management',
  templateUrl: './seller-return-management.component.html',
  styleUrls: ['./seller-return-management.component.css'],
  standalone: false,
})
export class SellerReturnManagementComponent implements OnInit {
  returnRequests: Order[] = [];
  isLoading: boolean = true;
  currentSeller: User | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    if (
      this.currentSeller &&
      (this.currentSeller.role === 'SELLER' ||
        this.currentSeller.role === 'ADMIN')
    ) {
      this.loadReturnRequests(this.currentSeller.id);
    } else {
      this.toastr.error('Unauthorized access.', 'Error');
      this.isLoading = false;
      this.router.navigate(['/']);
    }
  }

  loadReturnRequests(sellerId: number): void {
    this.isLoading = true;
    this.orderService.getReturnRequestsBySellerId(sellerId).subscribe({
      next: (data) => {
        this.returnRequests = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading return requests:', err);
        this.toastr.error('Failed to load return requests.', 'Error');
        this.isLoading = false;
      },
    });
  }

  // İleride kullanılacak aksiyon metotları için placeholder'lar
  approveReturn(orderId: number): void {
    this.toastr.info(`Approve return for order ${orderId} - Not implemented.`);
  }

  rejectReturn(orderId: number): void {
    this.toastr.info(`Reject return for order ${orderId} - Not implemented.`);
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/seller/my-orders', orderId]); // Satıcı sipariş detayına git
  }

  // Sadece bu satıcıya ait ürünleri filtrelemek için (HTML'de kullanılabilir)
  getSellerItems(order: Order): any[] {
    if (!this.currentSeller) return [];
    return order.items.filter(
      (item) => item.seller_id === this.currentSeller!.id
    );
  }
}
