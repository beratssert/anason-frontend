import { Component, OnInit } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';
import { OrderService } from '../../../../core/services/order.service';
import { ProductService } from '../../../../features/product/services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: false,
})
export class AdminDashboardComponent implements OnInit {
  isLoading: boolean = true;
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalComplaints: number;
  } | null = null;

  userRoleData: { name: string; value: number }[] = [];
  orderStatusData: { name: string; value: number }[] = [];
  orderStatusYAxisTicks: number[] = [];

  constructor(
    private adminService: AdminService,
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    forkJoin({
      users: this.adminService.getUsers(),
      products: this.productService.getProducts(),
      orders: this.orderService.getAllOrders(),
      complaints: this.adminService.getComplaints(),
    })
      .pipe(
        map(({ users, products, orders, complaints }) => {
          const totalUsers = users.length;
          const totalProducts = products.length;
          const totalOrders = orders.length;
          const totalComplaints = complaints.length;

          const roles = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });
          const userRoleChartData = Object.keys(roles).map((role) => ({
            name: role,
            value: roles[role],
          }));

          const statuses = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });
          const orderStatusChartData = Object.keys(statuses).map((status) => ({
            name: status,
            value: statuses[status],
          }));

          const orderCounts = orderStatusChartData.map((item) => item.value);
          const maxValue =
            orderCounts.length > 0 ? Math.max(...orderCounts) : 0;
          const yAxisTicksArray = [];
          for (let i = 0; i <= maxValue; i++) {
            yAxisTicksArray.push(i);
          }
          if (yAxisTicksArray.length < 2) {
            yAxisTicksArray.push(1);
          }

          return {
            stats: { totalUsers, totalProducts, totalOrders, totalComplaints },
            userRoleData: userRoleChartData,
            orderStatusData: orderStatusChartData,
            yAxisTicks: yAxisTicksArray,
          };
        })
      )
      .subscribe({
        next: (data) => {
          this.stats = data.stats;
          this.userRoleData = data.userRoleData;
          this.orderStatusData = data.orderStatusData;
          this.orderStatusYAxisTicks = data.yAxisTicks;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);
          this.isLoading = false;
        },
      });
  }

  // Y Ekseni Etiket Formatlama Fonksiyonu
  formatYAxisTick(value: any): string {
    return Math.round(value).toString();
  }
}
