import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import {
  OrderService,
  Order,
  OrderStatus,
  TrackingInfo,
} from '../../../../core/services/order.service';
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
  updatingStatus: boolean = false; // Used for cancel/return requests
  trackingInfo: TrackingInfo | null = null;
  isLoadingTracking: boolean = false;
  invoiceLink: string | null = null;
  isLoadingInvoice: boolean = false;

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
    this.trackingInfo = null; // Reset tracking info on load
    this.invoiceLink = null; // Reset invoice link on load

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
    if (!orderId || !this.currentUser || !this.order || this.updatingStatus)
      return;

    if (this.order.status !== 'DELIVERED') {
      this.toastr.warning(
        `Return can only be requested for DELIVERED orders. Current status: ${this.order.status}.`
      );
      return;
    }

    if (
      confirm(
        `Are you sure you want to request a return for Order #${orderId}?`
      )
    ) {
      this.updatingStatus = true;
      this.orderService.requestReturn(orderId, this.currentUser.id).subscribe({
        next: (updatedOrder) => {
          if (updatedOrder && this.order) {
            this.order.status = updatedOrder.status;
            this.toastr.success(
              `Return requested for Order #${orderId}.`,
              'Return Requested'
            );
          } else {
            this.toastr.error(
              `Could not request return for order #${orderId}.`,
              'Error'
            );
          }
          this.updatingStatus = false;
        },
        error: (err) => {
          console.error(`Error requesting return for order ${orderId}:`, err);
          this.toastr.error(
            err.message || `Failed to request return for order #${orderId}.`,
            'Error'
          );
          this.updatingStatus = false;
        },
      });
    }
  }

  trackPackage(orderId: number | null): void {
    if (!orderId || !this.currentUser || this.isLoadingTracking) return;

    this.isLoadingTracking = true;
    this.trackingInfo = null;

    this.orderService.getTrackingInfo(orderId, this.currentUser.id).subscribe({
      next: (info) => {
        if (info) {
          this.trackingInfo = info;
          this.toastr.info(
            `Tracking #: ${info.number} via ${info.carrier}.`,
            'Tracking Info'
          );
          // Sahte URL'i yeni sekmede açma isteğe bağlı
          // if (info.url && info.url !== '#') {
          //     window.open(info.url, '_blank');
          // }
        } else {
          this.toastr.warning(
            'Tracking information is not available for this order yet.',
            'Not Found'
          );
        }
        this.isLoadingTracking = false;
      },
      error: (err) => {
        console.error(
          `Error fetching tracking info for order ${orderId}:`,
          err
        );
        this.toastr.error('Could not retrieve tracking information.', 'Error');
        this.isLoadingTracking = false;
      },
    });
  }

  viewInvoice(orderId: number | null): void {
    if (!orderId || !this.currentUser || this.isLoadingInvoice) return;

    this.isLoadingInvoice = true;
    this.invoiceLink = null;

    this.orderService.getInvoiceLink(orderId, this.currentUser.id).subscribe({
      next: (link) => {
        if (link) {
          this.invoiceLink = link;
          this.toastr.info('Opening invoice...');
          window.open(this.invoiceLink, '_blank');
        } else {
          this.toastr.warning(
            'Invoice is not available for this order.',
            'Not Found'
          );
        }
        this.isLoadingInvoice = false;
      },
      error: (err) => {
        console.error(`Error fetching invoice link for order ${orderId}:`, err);
        this.toastr.error('Could not retrieve invoice link.', 'Error');
        this.isLoadingInvoice = false;
      },
    });
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  viewRelatedUser(userId: number): void {
    this.router.navigate(['/admin/users'], { queryParams: { search: userId } });
  }
}
