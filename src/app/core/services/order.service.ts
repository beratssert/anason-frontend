import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// SQL şemasına göre Interface'ler
export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  // Gösterim kolaylığı için eklenebilir (normalde ProductService'ten alınır)
  productName?: string;
  imageUrl?: string;
}

export interface Order {
  id: number; // orders.id
  user_id: number; // orders.user_id
  status:
    | 'PENDING'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURN_REQUESTED'
    | 'RETURNED'; // orders.status
  total_price: number; // orders.total_price
  created_at: Date | string; // orders.created_at
  items: OrderItem[]; // order_items tablosundan gelenler
  // logistic_id, shipping_address_id gibi alanlar da eklenebilir
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // Mock Sipariş Verileri
  // user_id'leri AuthService'teki mock user ID'leri ile eşleştirelim (1, 2)
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

  constructor() {}

  // Kullanıcı ID'sine göre siparişleri getiren mock metot
  getOrdersByUserId(userId: number): Observable<Order[]> {
    console.log(`OrderService (Mock): Fetching orders for User ID: ${userId}`);
    // Gerçek uygulamada API çağrısı /api/users/{userId}/orders gibi bir endpoint'e yapılır
    const userOrders = this.mockOrders.filter(
      (order) => order.user_id === userId
    );
    // Siparişleri tarihe göre tersten sıralayabiliriz (en yeni en üstte)
    userOrders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    console.log(
      `Found ${userOrders.length} orders for user ${userId}:`,
      userOrders
    );
    return of(userOrders).pipe(delay(400)); // API gecikmesini simüle et
  }

  // Tek bir siparişin detayını getiren mock metot (ileride lazım olabilir)
  getOrderById(orderId: number, userId: number): Observable<Order | undefined> {
    console.log(
      `OrderService (Mock): Fetching order details for Order ID: ${orderId}, User ID: ${userId}`
    );
    const order = this.mockOrders.find(
      (o) => o.id === orderId && o.user_id === userId
    );
    return of(order).pipe(delay(200));
  }
}
