import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../../core/services/auth.service';
import { OrderService, Order } from '../../../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
  standalone: false,
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = true;
  currentUser: User | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.loadOrders(this.currentUser.id);
    } else {
      // Guard zaten engellemeli ama ekstra kontrol
      this.toastr.error(
        'You must be logged in to view order history.',
        'Error'
      );
      this.isLoading = false;
      // Opsiyonel: Login'e yönlendirilebilir
    }
  }

  loadOrders(userId: number): void {
    this.isLoading = true;
    this.orderService.getOrdersByUserId(userId).subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.toastr.error('Failed to load your orders.', 'Error');
        this.isLoading = false;
      },
    });
  }
}
