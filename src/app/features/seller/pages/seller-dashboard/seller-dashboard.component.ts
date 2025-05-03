import { Component, OnInit } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { AuthService, User } from '../../../../core/services/auth.service';
import {
  OrderService,
  Order,
  OrderItem,
  OrderStatus,
} from '../../../../core/services/order.service';
import { ProductService } from '../../../../features/product/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router'; // Router eklendi (opsiyonel yönlendirme için)

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
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  } | null = null;

  // Grafik Verileri
  orderStatusData: { name: string; value: number }[] = [];
  orderStatusYAxisTicks: number[] = [];
  topSellingProductsData: { name: string; value: number }[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private productService: ProductService,
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
      this.loadDashboardData(this.currentSeller.id);
    } else {
      this.toastr.error('Unauthorized access.', 'Error');
      this.isLoading = false;
      this.router.navigate(['/']); // Yetkisizse ana sayfaya yönlendir
    }
  }

  loadDashboardData(sellerId: number): void {
    this.isLoading = true;
    forkJoin({
      products: this.productService.getProductsBySellerId(sellerId),
      orders: this.orderService.getOrdersBySellerId(sellerId),
    })
      .pipe(
        map(({ products, orders }) => {
          const totalProducts = products.length;
          const totalOrders = orders.length;
          const pendingOrders = orders.filter(
            (o) => o.status === 'PENDING' || o.status === 'PROCESSING'
          ).length;

          let totalRevenue = 0;
          const productSalesQuantity: { [productId: number]: number } = {};

          orders.forEach((order) => {
            if (order.status === 'DELIVERED') {
              // Sadece teslim edilenler
              order.items.forEach((item) => {
                if (item.seller_id === sellerId) {
                  totalRevenue += item.unit_price * item.quantity;
                  productSalesQuantity[item.product_id] =
                    (productSalesQuantity[item.product_id] || 0) +
                    item.quantity;
                }
              });
            }
          });

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
          const yAxisTicksArray = [];
          for (let i = 0; i <= maxOrderValue; i++) {
            yAxisTicksArray.push(i);
          }
          if (yAxisTicksArray.length < 2) {
            yAxisTicksArray.push(1);
          }

          const topSellingProductsChartData = Object.keys(productSalesQuantity)
            .map((productIdStr) => {
              const productId = parseInt(productIdStr, 10);
              const productInfo = products.find((p) => p.id === productId);
              return {
                name: productInfo
                  ? productInfo.name.length > 25
                    ? productInfo.name.substring(0, 22) + '...'
                    : productInfo.name
                  : `Product ID ${productId}`, // İsmi kısalt
                value: productSalesQuantity[productId],
              };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // İlk 5

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
          this.toastr.error('Failed to load dashboard data.', 'Error');
          this.isLoading = false;
        },
      });
  }

  formatYAxisTick(value: any): string {
    return Math.round(value).toString();
  }
}
