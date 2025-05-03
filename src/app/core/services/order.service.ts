import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interface'ler
export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  productName?: string;
  imageUrl?: string;
  seller_id?: number;
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

export interface TrackingInfo {
  number: string;
  url: string;
  carrier: string;
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
          seller_id: 101,
        },
        {
          product_id: 2,
          quantity: 1,
          unit_price: 25.5,
          productName: 'Organic Cotton T-Shirt',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 2,
        },
      ],
    },
    {
      id: 1002,
      user_id: 1,
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
          seller_id: 101,
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
          seller_id: 2,
        },
        {
          product_id: 4,
          quantity: 1,
          unit_price: 35.99,
          productName: 'Ceramic Coffee Mug Set (Set of 4)',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 103,
        },
        {
          product_id: 6,
          quantity: 1,
          unit_price: 9.99,
          productName: 'Smartphone Holder Grip',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 101,
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
          seller_id: 2,
        },
      ],
    },
    {
      id: 1005,
      user_id: 1,
      status: 'PROCESSING',
      total_price: 45.45,
      created_at: new Date('2024-05-02T10:00:00Z'),
      items: [
        {
          product_id: 2,
          quantity: 1,
          unit_price: 25.5,
          productName: 'Organic Cotton T-Shirt',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 2,
        },
        {
          product_id: 7,
          quantity: 1,
          unit_price: 19.95,
          productName: 'Bamboo Cutting Board',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 2,
        },
      ],
    },
    {
      id: 1006,
      user_id: 3,
      status: 'DELIVERED',
      total_price: 109.85,
      created_at: new Date('2024-04-30T18:00:00Z'),
      items: [
        {
          product_id: 5,
          quantity: 1,
          unit_price: 89.9,
          productName: 'Running Shoes - Model Runner',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 2,
        },
        {
          product_id: 6,
          quantity: 2,
          unit_price: 9.99,
          productName: 'Smartphone Holder Grip',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 101,
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
    const userOrders = this.mockOrders.filter((o) => o.user_id === userId);
    userOrders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return of(
      userOrders.map((o) => ({ ...o, created_at: new Date(o.created_at) }))
    ).pipe(delay(400));
  }

  getOrderById(orderId: number, userId: number): Observable<Order | undefined> {
    const order = this.mockOrders.find(
      (o) => o.id === orderId && o.user_id === userId
    );
    return of(
      order ? { ...order, created_at: new Date(order.created_at) } : undefined
    ).pipe(delay(200));
  }

  getAllOrders(): Observable<Order[]> {
    const allOrders = [...this.mockOrders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return of(
      allOrders.map((o) => ({ ...o, created_at: new Date(o.created_at) }))
    ).pipe(delay(350));
  }

  updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus
  ): Observable<Order | null> {
    const orderIndex = this.mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex > -1) {
      this.mockOrders[orderIndex].status = newStatus;
      return of({
        ...this.mockOrders[orderIndex],
        created_at: new Date(this.mockOrders[orderIndex].created_at),
      }).pipe(delay(250));
    } else {
      return of(null).pipe(delay(250));
    }
  }

  getOrdersBySellerId(sellerId: number): Observable<Order[]> {
    const sellerOrders = this.mockOrders.filter((order) =>
      order.items.some((item) => item.seller_id === sellerId)
    );
    sellerOrders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return of(
      sellerOrders.map((o) => ({ ...o, created_at: new Date(o.created_at) }))
    ).pipe(delay(300));
  }

  updateOrderStatusBySeller(
    orderId: number,
    newStatus: OrderStatus,
    sellerId: number
  ): Observable<Order | null> {
    const orderIndex = this.mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return throwError(() => new Error(`Order #${orderId} not found.`));
    }
    const order = this.mockOrders[orderIndex];
    const hasSellerItem = order.items.some(
      (item) => item.seller_id === sellerId
    );
    // Admin (ID 3) de bu metodu kullanabilir diye kontrol ekleyelim (ya da ayrı metot daha iyi)
    if (!hasSellerItem && sellerId !== 3) {
      return throwError(
        () => new Error('Permission denied to update this order status.')
      );
    }
    const currentStatus = order.status;
    let allowed = false;
    if (currentStatus === 'PENDING' && newStatus === 'PROCESSING') {
      allowed = true;
    } else if (currentStatus === 'PROCESSING' && newStatus === 'SHIPPED') {
      allowed = true;
    }
    if (!allowed) {
      return throwError(
        () =>
          new Error(
            `Seller cannot change status from ${currentStatus} to ${newStatus}.`
          )
      );
    }
    this.mockOrders[orderIndex].status = newStatus;
    return of({
      ...this.mockOrders[orderIndex],
      created_at: new Date(this.mockOrders[orderIndex].created_at),
    }).pipe(delay(250));
  }

  cancelOrder(orderId: number, userId: number): Observable<Order | null> {
    const orderIndex = this.mockOrders.findIndex(
      (o) => o.id === orderId && o.user_id === userId
    );
    if (orderIndex === -1) {
      return throwError(() => new Error(`Order #${orderId} not found.`));
    }
    const order = this.mockOrders[orderIndex];
    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      return throwError(
        () => new Error(`Order cannot be cancelled in ${order.status} status.`)
      );
    }
    this.mockOrders[orderIndex].status = 'CANCELLED';
    const updatedOrder = {
      ...this.mockOrders[orderIndex],
      created_at: new Date(this.mockOrders[orderIndex].created_at),
    };
    return of(updatedOrder).pipe(delay(300));
  }

  requestReturn(orderId: number, userId: number): Observable<Order | null> {
    const orderIndex = this.mockOrders.findIndex(
      (o) => o.id === orderId && o.user_id === userId
    );
    if (orderIndex === -1) {
      return throwError(() => new Error(`Order #${orderId} not found.`));
    }
    const order = this.mockOrders[orderIndex];
    if (order.status !== 'DELIVERED') {
      return throwError(
        () =>
          new Error(
            `Return can only be requested for DELIVERED orders. Current status: ${order.status}`
          )
      );
    }
    this.mockOrders[orderIndex].status = 'RETURN_REQUESTED';
    const updatedOrder = {
      ...this.mockOrders[orderIndex],
      created_at: new Date(this.mockOrders[orderIndex].created_at),
    };
    return of(updatedOrder).pipe(delay(300));
  }

  // EKLENDİ: Seller için Sipariş Detayı Getirme Metodu
  getOrderDetailForSeller(
    orderId: number,
    sellerId: number
  ): Observable<Order | undefined> {
    console.log(
      `OrderService (Mock): Fetching order details for Order ID: ${orderId}, Seller ID: ${sellerId}`
    );
    const order = this.mockOrders.find((o) => o.id === orderId);

    if (!order) {
      console.log(`Order ${orderId} not found.`);
      return of(undefined).pipe(delay(100));
    }

    const hasSellerItem = order.items.some(
      (item) => item.seller_id === sellerId
    );
    const isAdmin = sellerId === 3; // Mock admin ID'si 3 varsayımı

    if (!hasSellerItem && !isAdmin) {
      console.warn(
        `Seller ${sellerId} does not have items in order ${orderId}. Access denied (mock).`
      );
      // Hata fırlatmak component'ta yakalamak için daha iyi olabilir
      // return throwError(() => new Error('Access denied to this order detail.'));
      return of(undefined).pipe(delay(100));
    }

    console.log('Found order for seller/admin:', order);
    const orderWithDate = { ...order, created_at: new Date(order.created_at) };
    return of(orderWithDate).pipe(delay(200));
  }

  getTrackingInfo(
    orderId: number,
    userId: number
  ): Observable<TrackingInfo | null> {
    const order = this.mockOrders.find(
      (o) => o.id === orderId && o.user_id === userId
    );
    if (order && (order.status === 'SHIPPED' || order.status === 'DELIVERED')) {
      const mockTracking: TrackingInfo = {
        number: `MOCKTRACK${orderId}XYZ`,
        url: `https://www.example-tracker.com/track?id=MOCKTRACK${orderId}XYZ`,
        carrier: 'Mock Kargo Intl.',
      };
      return of(mockTracking).pipe(delay(150));
    } else {
      return of(null).pipe(delay(100));
    }
  }

  getInvoiceLink(orderId: number, userId: number): Observable<string | null> {
    const order = this.mockOrders.find(
      (o) => o.id === orderId && o.user_id === userId
    );
    if (order && order.status !== 'CANCELLED' && order.status !== 'PENDING') {
      const mockPdfUrl = `/assets/invoices/mock-invoice-${orderId}.pdf`;
      return of(mockPdfUrl).pipe(delay(120));
    } else {
      return of(null).pipe(delay(100));
    }
  }
}
