import { Component, OnInit, inject } from '@angular/core'; // inject eklendi
import { forkJoin, map } from 'rxjs';
import { AuthService, User } from '../../../../core/services/auth.service';
import { OrderService, Order } from '../../../../core/services/order.service'; // Order tipi kaldırıldı (kullanılmıyor)
import { ProductService } from '../../../../features/product/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css'],
  standalone: false,
})
export class SellerDashboardComponent implements OnInit {
  isLoading: boolean = true;
  currentSeller: User | null = null;
  stats: {
    totalProducts: number;
    totalOrders: number; // Bu hala tüm siparişler mi, yoksa satıcıyla ilgili mi? Backend'e bağlı.
    totalRevenue: number;
    pendingOrders: number;
  } | null = null;

  orderStatusData: { name: string; value: number }[] = [];
  orderStatusYAxisTicks: number[] = [];
  topSellingProductsData: { name: string; value: number }[] = [];

  // Inject Dependencies
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    if (
      this.currentSeller &&
      (this.currentSeller.role === 'SELLER' ||
        this.currentSeller.role === 'ADMIN')
    ) {
      this.loadDashboardData(this.currentSeller.id); // sellerId argümanı burada kalabilir, çünkü orderService.getOrdersBySellerId onu kullanıyor (şimdilik)
    } else {
      this.toastr.error('Unauthorized access.', 'Error');
      this.isLoading = false;
      this.router.navigate(['/']);
    }
  }

  loadDashboardData(sellerId: number): void {
    this.isLoading = true;
    forkJoin({
      // --- DÜZELTME (TS2554) ---
      // getProductsBySellerId argüman almıyor
      products: this.productService.getProductsBySellerId(),
      // --- DÜZELTME SONU ---
      // OrderService'teki getOrdersBySellerId mock olduğu için sellerId alıyor olabilir, onu sonra düzeltiriz.
      orders: this.orderService.getOrdersBySellerId(sellerId),
    })
      .pipe(
        map(({ products, orders }) => {
          const totalProducts = products.length;
          // totalOrders ve diğer hesaplamalar backend'den dönen order verisine göre yapılmalı
          const totalOrders = orders.length;
          const pendingOrders = orders.filter(
            (o) => o.status === 'PENDING' || o.status === 'PROCESSING'
          ).length;

          let totalRevenue = 0;
          const productSalesQuantity: { [productId: number]: number } = {};

          // Gelir ve satış miktarı hesaplaması
          orders.forEach((order) => {
            if (order.status === 'DELIVERED') {
              order.items.forEach((item) => {
                // Backend OrderItemDTO'sunda seller_id varsa kontrol et
                // Eğer yoksa, product bilgisi üzerinden kontrol et (products listesinden)
                const productInfo = products.find(
                  (p) => p.id === item.product_id
                );
                if (productInfo && productInfo.seller_id === sellerId) {
                  totalRevenue += item.unit_price * item.quantity;
                  productSalesQuantity[item.product_id] =
                    (productSalesQuantity[item.product_id] || 0) +
                    item.quantity;
                } else if (item.seller_id === sellerId) {
                  // Eğer OrderItem'da seller_id varsa
                  totalRevenue += item.unit_price * item.quantity;
                  productSalesQuantity[item.product_id] =
                    (productSalesQuantity[item.product_id] || 0) +
                    item.quantity;
                }
              });
            }
          });

          // Sipariş durumu grafiği
          const statuses = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });
          const orderStatusChartData = Object.keys(statuses).map((status) => ({
            name: status,
            value: statuses[status],
          }));
          const orderCounts = orderStatusChartData.map((item) => item.value);
          const maxOrderValue =
            orderCounts.length > 0 ? Math.max(...orderCounts) : 0;
          const yAxisTicksArray = Array.from(
            { length: maxOrderValue + 1 },
            (_, i) => i
          ); // Y ekseni için tamsayılar
          if (yAxisTicksArray.length < 2) yAxisTicksArray.push(1);

          // En çok satan ürünler grafiği
          const topSellingProductsChartData = Object.keys(productSalesQuantity)
            .map((productIdStr) => {
              const productId = parseInt(productIdStr, 10);
              const productInfo = products.find((p) => p.id === productId);
              return {
                name: productInfo
                  ? productInfo.name.substring(0, 25) +
                    (productInfo.name.length > 25 ? '...' : '')
                  : `P ID ${productId}`,
                value: productSalesQuantity[productId],
              };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          return {
            stats: { totalProducts, totalOrders, totalRevenue, pendingOrders },
            orderStatusData: orderStatusChartData,
            yAxisTicks: yAxisTicksArray,
            topSellingProductsData: topSellingProductsChartData,
          };
        })
      )
      .subscribe({
        next: (data) => {
          this.stats = data.stats;
          this.orderStatusData = data.orderStatusData;
          this.orderStatusYAxisTicks = data.yAxisTicks;
          this.topSellingProductsData = data.topSellingProductsData;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading seller dashboard data:', err);
          this.toastr.error(
            err.message || 'Failed to load dashboard data.',
            'Error'
          );
          this.isLoading = false;
        },
      });
  }

  formatYAxisTick(value: any): string {
    return Math.round(value).toString();
  }
}
