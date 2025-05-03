import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import {
  OrderService,
  Order,
  OrderStatus,
  OrderItem,
} from '../../../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-seller-order-detail',
  templateUrl: './seller-order-detail.component.html',
  styleUrls: ['./seller-order-detail.component.css'],
  standalone: false,
})
export class SellerOrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading: boolean = true;
  errorLoading: string | null = null;
  updatingStatus: boolean = false;
  currentSeller: User | null = null;
  orderId: number | null = null;
  possibleStatuses: OrderStatus[];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.possibleStatuses = this.orderService.orderStatuses;
  }

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    if (!this.currentSeller) {
      this.errorLoading = 'User not logged in.';
      this.isLoading = false;
      this.toastr.error(this.errorLoading);
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadOrderDetails();
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.order = null;

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('orderId');
          if (!idParam) {
            this.errorLoading = 'Order ID is missing in the URL.';
            return of(undefined);
          }
          const orderId = parseInt(idParam, 10);
          if (isNaN(orderId)) {
            this.errorLoading = 'Invalid Order ID in the URL.';
            return of(undefined);
          }
          this.orderId = orderId;
          return this.orderService
            .getOrderDetailForSeller(orderId, this.currentSeller!.id)
            .pipe(
              catchError((err) => {
                console.error('Error fetching seller order details:', err);
                this.errorLoading = 'Failed to load order details.';
                return of(undefined);
              })
            );
        })
      )
      .subscribe((data) => {
        this.isLoading = false;
        if (data) {
          this.order = data;
        } else if (!this.errorLoading) {
          this.errorLoading =
            'Order not found or you do not have permission to view it.';
        }
      });
  }

  getSellerItems(order: Order | null): OrderItem[] {
    if (!order || !this.currentSeller) return [];
    return order.items.filter(
      (item) => item.seller_id === this.currentSeller!.id
    );
  }

  getAllItems(order: Order | null): OrderItem[] {
    return order?.items || [];
  }

  updateSellerOrderStatus(newStatus: OrderStatus): void {
    if (!this.order || !this.currentSeller || this.updatingStatus) {
      return;
    }

    const currentStatus = this.order.status;
    if (
      !(
        (currentStatus === 'PENDING' && newStatus === 'PROCESSING') ||
        (currentStatus === 'PROCESSING' && newStatus === 'SHIPPED')
      )
    ) {
      this.toastr.warning(
        `Action to change status from ${currentStatus} to ${newStatus} is not available.`,
        'Action Denied'
      );
      return;
    }

    this.updatingStatus = true;

    this.orderService
      .updateOrderStatusBySeller(
        this.order.id,
        newStatus,
        this.currentSeller.id
      )
      .subscribe({
        next: (updatedOrder) => {
          if (updatedOrder && this.order) {
            this.order.status = updatedOrder.status;
            this.toastr.success(
              `Order #${this.order.id} status updated to ${newStatus}.`,
              'Success'
            );
          } else {
            this.toastr.error(
              `Failed to update status for order #${this.order?.id}.`,
              'Update Failed'
            );
          }
          this.updatingStatus = false;
        },
        error: (err) => {
          console.error(
            `Error updating order status for ${this.order?.id} by seller:`,
            err
          );
          this.toastr.error(
            err.message ||
              `Failed to update status for order #${this.order?.id}.`,
            'Error'
          );
          this.updatingStatus = false;
        },
      });
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}
