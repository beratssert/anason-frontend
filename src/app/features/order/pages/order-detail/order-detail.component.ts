import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { OrderService, Order } from '../../../../core/services/order.service';
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
      // Artık tanımlı olan handleError metodunu çağırıyoruz
      this.handleError('User not logged in. Redirecting to login.');
      // Hata sonrası yönlendirme handleError içinde yapılıyor
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
            // Hata durumunu handleError ile yönetelim
            this.handleError('Order ID is missing in the URL.');
            return of(undefined);
          }
          const orderId = parseInt(idParam, 10);
          if (isNaN(orderId)) {
            // Hata durumunu handleError ile yönetelim
            this.handleError('Invalid Order ID in the URL.');
            return of(undefined);
          }
          this.orderId = orderId;
          return this.orderService.getOrderById(orderId, userId).pipe(
            catchError((err) => {
              // Hata durumunu handleError ile yönetelim
              console.error('Error fetching order details:', err);
              this.handleError('Failed to load order details.');
              return of(undefined);
            })
          );
        })
      )
      .subscribe((data) => {
        this.isLoading = false; // Yükleme bitti (başarılı veya başarısız)
        if (data) {
          this.order = data;
          this.order.created_at = new Date(this.order.created_at);
        } else if (!this.errorLoading) {
          // Servisten null döndüyse veya catchError çalışmadıysa (yetki vb.)
          this.handleError('Order not found or access denied.');
        }
        // Hata varsa zaten handleError içinde set edildi
      });
  }

  // YENİ: Hata yönetimi için yardımcı metot
  private handleError(errorMessage: string): void {
    this.errorLoading = errorMessage;
    this.isLoading = false; // Yükleme bitti (hata ile)
    this.toastr.error(errorMessage, 'Error');
    // Kullanıcı giriş yapmamışsa veya ciddi bir hata varsa yönlendirme yapılabilir
    if (errorMessage.includes('User not logged in')) {
      this.router.navigate(['/auth/login']);
    } else if (
      errorMessage.includes('Order ID is missing') ||
      errorMessage.includes('Invalid Order ID')
    ) {
      this.router.navigate(['/orders']); // Sipariş listesine geri dön
    } else if (errorMessage.includes('access denied')) {
      this.router.navigate(['/orders']); // Sipariş listesine geri dön
    }
  }

  // Müşteri Aksiyonları (Placeholder Metotlar)
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

  cancelOrder(orderId: number | null): void {
    if (!orderId) return;
    if (confirm('Are you sure you want to cancel this order?')) {
      this.toastr.info(
        `Order #${orderId} cancellation requested (not implemented).`
      );
    }
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}
