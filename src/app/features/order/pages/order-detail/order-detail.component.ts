import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import {
  OrderService,
  Order,
  OrderStatus,
} from '../../../../core/services/order.service'; // OrderStatus import edildiğinden emin ol
import { ToastrService } from 'ngx-toastr';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
  standalone: false,
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading: boolean = true;
  errorLoading: string | null = null;
  currentUser: User | null = null;
  orderId: number | null = null;
  updatingStatus: boolean = false; // Eksik olan değişken tanımı EKLENDİ

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser) {
      this.handleError('User not logged in. Redirecting to login.');
      return;
    }
    this.loadOrderDetails(this.currentUser.id);
  }

  loadOrderDetails(userId: number): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.order = null;

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('orderId');
          if (!idParam) {
            this.handleError('Order ID is missing in the URL.');
            return of(undefined);
          }
          const orderId = parseInt(idParam, 10);
          if (isNaN(orderId)) {
            this.handleError('Invalid Order ID in the URL.');
            return of(undefined);
          }
          this.orderId = orderId;
          return this.orderService.getOrderById(orderId, userId).pipe(
            catchError((err) => {
              console.error('Error fetching order details:', err);
              this.handleError('Failed to load order details.');
              return of(undefined);
            })
          );
        })
      )
      .subscribe((data) => {
        this.isLoading = false;
        if (data) {
          this.order = data;
          this.order.created_at = new Date(this.order.created_at);
        } else if (!this.errorLoading) {
          this.handleError('Order not found or access denied.');
        }
      });
  }

  private handleError(errorMessage: string): void {
    this.errorLoading = errorMessage;
    this.isLoading = false;
    this.toastr.error(errorMessage, 'Error');
    if (errorMessage.includes('User not logged in')) {
      this.router.navigate(['/auth/login']);
    } else if (
      errorMessage.includes('Order ID is missing') ||
      errorMessage.includes('Invalid Order ID') ||
      errorMessage.includes('access denied')
    ) {
      this.router.navigate(['/orders']);
    }
  }

  cancelOrder(orderId: number | null): void {
    if (!orderId || !this.currentUser || !this.order || this.updatingStatus)
      return;

    if (this.order.status !== 'PENDING' && this.order.status !== 'PROCESSING') {
      this.toastr.warning(
        `Order cannot be cancelled in ${this.order.status} status.`
      );
      return;
    }

    if (
      confirm(
        `Are you sure you want to cancel Order #${orderId}? This action might not be reversible.`
      )
    ) {
      this.updatingStatus = true;

      this.orderService.cancelOrder(orderId, this.currentUser.id).subscribe({
        next: (updatedOrder) => {
          if (updatedOrder && this.order) {
            this.order.status = updatedOrder.status;
            this.toastr.success(
              `Order #${orderId} has been cancelled.`,
              'Order Cancelled'
            );
          } else {
            this.toastr.error(
              `Could not cancel order #${orderId}. Order not found or cannot be cancelled.`,
              'Error'
            );
          }
          this.updatingStatus = false;
        },
        error: (err) => {
          console.error(`Error cancelling order ${orderId}:`, err);
          this.toastr.error(
            err.message || `Failed to cancel order #${orderId}.`,
            'Error'
          );
          this.updatingStatus = false;
        },
      });
    }
  }

  requestReturn(orderId: number | null): void {
    if (!orderId) return;
    this.toastr.info(
      `Return request for order #${orderId} initiated (not implemented).`
    );
  }

  trackPackage(orderId: number | null): void {
    if (!orderId) return;
    this.toastr.info(
      `Tracking package for order #${orderId} (not implemented).`
    );
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}
