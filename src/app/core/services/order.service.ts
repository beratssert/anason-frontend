import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces
export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  productName?: string; // Mock data convenience
  imageUrl?: string; // Mock data convenience
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_price: number;
  created_at: Date | string;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // Mock Data
  private mockOrders: Order[] = [
    {
      id: 1001,
      user_id: 1,
      status: 'DELIVERED',
      total_price: 225.49,
      created_at: new Date('2024-04-25T11:00:00Z'),
      items: [
        {
          product_id: 1,
          quantity: 1,
          unit_price: 199.99,
          productName: 'Smartwatch Pro X',
          imageUrl: 'assets/images/placeholder.png',
        },
        {
          product_id: 2,
          quantity: 1,
          unit_price: 25.5,
          productName: 'Organic Cotton T-Shirt',
          imageUrl: 'assets/images/placeholder.png',
        },
      ],
    },
    {
      id: 1002,
      user_id: 2,
      status: 'SHIPPED',
      total_price: 149.0,
      created_at: new Date('2024-04-28T15:30:00Z'),
      items: [
        {
          product_id: 3,
          quantity: 1,
          unit_price: 149.0,
          productName: 'Wireless Noise-Cancelling Headphones',
          imageUrl: 'assets/images/placeholder.png',
        },
      ],
    },
    {
      id: 1003,
      user_id: 1,
      status: 'PROCESSING',
      total_price: 99.85,
      created_at: new Date('2024-05-01T09:10:00Z'),
      items: [
        {
          product_id: 7,
          quantity: 2,
          unit_price: 19.95,
          productName: 'Bamboo Cutting Board',
          imageUrl: 'assets/images/placeholder.png',
        },
        {
          product_id: 4,
          quantity: 1,
          unit_price: 35.99,
          productName: 'Ceramic Coffee Mug Set (Set of 4)',
          imageUrl: 'assets/images/placeholder.png',
        },
        {
          product_id: 6,
          quantity: 1,
          unit_price: 9.99,
          productName: 'Smartphone Holder Grip',
          imageUrl: 'assets/images/placeholder.png',
        },
      ],
    },
    {
      id: 1004,
      user_id: 1,
      status: 'CANCELLED',
      total_price: 89.9,
      created_at: new Date('2024-03-15T12:00:00Z'),
      items: [
        {
          product_id: 5,
          quantity: 1,
          unit_price: 89.9,
          productName: 'Running Shoes - Model Runner',
          imageUrl: 'assets/images/placeholder.png',
        },
      ],
    },
  ];

  public readonly orderStatuses: OrderStatus[] = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED',
  ];

  constructor() {}

  getOrdersByUserId(userId: number): Observable<Order[]> {
    const userOrders = this.mockOrders.filter(
      (order) => order.user_id === userId
    );
    userOrders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return of(userOrders).pipe(delay(400));
  }

  getOrderById(orderId: number, userId: number): Observable<Order | undefined> {
    const order = this.mockOrders.find(
      (o) => o.id === orderId && o.user_id === userId
    );
    return of(order).pipe(delay(200));
  }

  getAllOrders(): Observable<Order[]> {
    const allOrders = [...this.mockOrders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return of(allOrders).pipe(delay(350));
  }

  updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus
  ): Observable<Order | null> {
    const orderIndex = this.mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex > -1) {
      this.mockOrders[orderIndex].status = newStatus;
      return of(this.mockOrders[orderIndex]).pipe(delay(250));
    } else {
      return of(null).pipe(delay(250));
    }
  }
}
