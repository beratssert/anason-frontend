import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  OrderService,
  Order,
  OrderStatus,
} from '../../../../core/services/order.service'; // OrderService ve tipleri import et
import { ToastrService } from 'ngx-toastr';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
// AdminService import'u kaldırıldı (kullanılmıyorsa) veya User için AuthService kullanılabilir
// import { AdminService } from '../../../core/services/admin.service';
import { AuthService, User } from '../../../../core/services/auth.service'; // Kullanıcı bilgisi için

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.css'],
  standalone: false,
})
export class AdminOrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading: boolean = true;
  errorLoading: string | null = null;
  updatingStatus: boolean = false;
  orderId: number | null = null;
  possibleStatuses: OrderStatus[];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toastr: ToastrService,
    private router: Router,
    // private adminService: AdminService, // Gerekirse kullanıcı bilgisi için
    private authService: AuthService // Veya direkt AuthService
  ) {
    this.possibleStatuses = this.orderService.orderStatuses;
  }

  ngOnInit(): void {
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
          // Admin olduğu için userId kontrolü olmayan metodu çağır
          return this.orderService.getOrderByIdForAdmin(orderId).pipe(
            catchError((err) => {
              console.error('Error fetching order details for admin:', err);
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
          // Tarih zaten serviste Date objesine çevriliyor olmalı
          // this.order.created_at = new Date(this.order.created_at);
        } else if (!this.errorLoading) {
          this.errorLoading = 'Order not found.';
        }
        if (this.errorLoading) {
          this.toastr.error(this.errorLoading, 'Error');
          // Hata varsa belki admin sipariş listesine yönlendirilebilir
          // this.router.navigate(['/admin/orders']);
        }
      });
  }

  // Durumu güncelleme metodu - GÜNCELLENDİ
  updateStatus(event: Event): void {
    // Metodun başında order null kontrolü EKLENDİ
    if (!this.order || this.updatingStatus) {
      return;
    }

    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as OrderStatus;

    // Değişiklik yoksa çık
    if (!newStatus || newStatus === this.order.status) {
      return;
    }

    // Orijinal durumu SAKLA
    const originalStatus = this.order.status;
    this.updatingStatus = true; // İşlem başladı

    // Admin için genel updateOrderStatus metodunu kullan
    this.orderService.updateOrderStatus(this.order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        if (updatedOrder && this.order) {
          this.order.status = updatedOrder.status; // Sadece status'ü güncelle
          this.toastr.success(
            `Order #${this.order.id} status updated to ${newStatus}.`,
            'Success'
          );
        } else {
          this.toastr.error(
            `Failed to update status for order #${this.order?.id}. Order not found?`,
            'Error'
          );
          // HATA/BAŞARISIZLIK DURUMU: Orijinal durumu kullanarak select'i geri al
          selectElement.value = originalStatus;
        }
        this.updatingStatus = false; // İşlem bitti
      },
      error: (err) => {
        console.error(
          `Error updating order status for ${this.order?.id}:`,
          err
        );
        this.toastr.error(
          `Failed to update status for order #${this.order?.id}.`,
          'Error'
        );
        // HATA DURUMU: Orijinal durumu kullanarak select'i geri al
        selectElement.value = originalStatus;
        this.updatingStatus = false; // İşlem bitti (hata ile)
      },
    });
  }

  // İlgili sayfalara linkler
  viewRelatedUser(userId: number): void {
    this.router.navigate(['/admin/users'], { queryParams: { search: userId } });
  }
  viewRelatedProduct(productId: number): void {
    this.router.navigate(['/admin/products', productId, 'edit']);
  }
  viewRelatedComplaint(orderId: number): void {
    this.router.navigate(['/admin/complaints'], {
      queryParams: { search: orderId },
    });
  }
}
