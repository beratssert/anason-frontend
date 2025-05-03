import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces
export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  productName?: string;
  imageUrl?: string;
  seller_id?: number; // Mock data için eklendi
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
  // Mock Data (OrderItem'larda seller_id ile güncellendi)
  private mockOrders: Order[] = [
    {
      id: 1001,
      user_id: 1,
      status: 'DELIVERED',
      total_price: 225.49,
      created_at: new Date('2024-04-25T11:00:00Z'),
      items: [
        // Bu siparişte Seller ID 101 ve 102'den ürünler var
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
      user_id: 2,
      status: 'SHIPPED',
      total_price: 149.0,
      created_at: new Date('2024-04-28T15:30:00Z'),
      items: [
        // Bu siparişte Seller ID 101'den ürün var
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
        // Bu siparişte Seller ID 102, 103 ve 101'den ürünler var
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
        // Bu siparişte Seller ID 102'den ürün var
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
    // YENİ EKLEDİĞİMİZ VEYA GÜNCELLEDİĞİMİZ SİPARİŞLER (Seller ID 2 İÇEREN)
    {
      id: 1005,
      user_id: 1,
      status: 'PROCESSING',
      total_price: 45.45,
      created_at: new Date('2024-05-02T10:00:00Z'),
      items: [
        // Bu siparişte Seller ID 2'den (bizim satıcımız) ürün var
        {
          product_id: 2,
          quantity: 1,
          unit_price: 25.5,
          productName: 'Organic Cotton T-Shirt',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 2,
        }, // BU DEĞİŞTİ -> SELLER_ID 2 OLMALI
        {
          product_id: 7,
          quantity: 1,
          unit_price: 19.95,
          productName: 'Bamboo Cutting Board',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 102,
        }, // BU DEĞİŞTİ -> SELLER_ID 2 OLMALI
      ],
    },
    {
      id: 1006,
      user_id: 3,
      status: 'DELIVERED',
      total_price: 109.85,
      created_at: new Date('2024-04-30T18:00:00Z'),
      items: [
        // Bu siparişte Seller ID 2'den ve 101'den ürünler var
        {
          product_id: 5,
          quantity: 1,
          unit_price: 89.9,
          productName: 'Running Shoes - Model Runner',
          imageUrl: 'assets/images/placeholder.png',
          seller_id: 2,
        }, // BU DEĞİŞTİ -> SELLER_ID 2 OLMALI
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
    // userId kontrolü customer için geçerli, admin/seller farklı olabilir
    const order = this.mockOrders.find(
      (o) => o.id === orderId && o.user_id === userId
    );
    // Admin/Seller için: const order = this.mockOrders.find(o => o.id === orderId);
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
      this.mockOrders[orderIndex].created_at = new Date(
        this.mockOrders[orderIndex].created_at
      ); // Tarihi koru/dönüştür
      return of({ ...this.mockOrders[orderIndex] }).pipe(delay(250));
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
    return of(sellerOrders).pipe(delay(300));
  }

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
      return of(undefined).pipe(delay(100)); // Sipariş yoksa undefined döndür
    }

    // Siparişte bu satıcıya ait en az bir ürün var mı kontrol et
    const hasSellerItem = order.items.some(
      (item) => item.seller_id === sellerId
    );

    if (!hasSellerItem && sellerId !== 3) {
      // Admin (ID:3) her siparişi görebilsin varsayımı
      console.warn(
        `Seller ${sellerId} does not have items in order ${orderId}. Access denied (mock).`
      );
      return of(undefined).pipe(delay(100)); // Yetkisi yoksa undefined döndür
    }

    console.log('Found order for seller:', order);
    // Tarihi Date objesine çevirelim
    const orderWithDate = { ...order, created_at: new Date(order.created_at) };
    return of(orderWithDate).pipe(delay(200));
  }

  updateOrderStatusBySeller(
    orderId: number,
    newStatus: OrderStatus,
    sellerId: number
  ): Observable<Order | null> {
    console.log(
      `OrderService (Mock): [SELLER ${sellerId}] Attempting to update status for order ${orderId} to ${newStatus}`
    );
    const orderIndex = this.mockOrders.findIndex((o) => o.id === orderId);

    if (orderIndex === -1) {
      console.error(`[SELLER ${sellerId}] Order ${orderId} not found.`);
      return of(null).pipe(delay(100)); // Sipariş bulunamadı
    }

    const order = this.mockOrders[orderIndex];

    // 1. Siparişte bu satıcıya ait ürün var mı? (Güvenlik kontrolü)
    const hasSellerItem = order.items.some(
      (item) => item.seller_id === sellerId
    );
    if (!hasSellerItem) {
      console.error(
        `[SELLER ${sellerId}] does not have items in order ${orderId}. Update denied.`
      );
      return throwError(
        () => new Error('Permission denied to update this order status.')
      ); // Hata fırlat
    }

    // 2. İzin verilen durum geçişi mi? (Örn: Sadece PROCESSING'den SHIPPED'a)
    const currentStatus = order.status;
    let allowed = false;
    if (currentStatus === 'PENDING' && newStatus === 'PROCESSING') {
      allowed = true;
    } else if (currentStatus === 'PROCESSING' && newStatus === 'SHIPPED') {
      allowed = true;
    }
    // İleride başka kurallar eklenebilir

    if (!allowed) {
      console.warn(
        `[SELLER ${sellerId}] Status transition from ${currentStatus} to ${newStatus} is not allowed for order ${orderId}.`
      );
      return throwError(
        () =>
          new Error(
            `Cannot change status from ${currentStatus} to ${newStatus}.`
          )
      ); // Hata fırlat
    }

    // Güncelleme işlemi
    this.mockOrders[orderIndex].status = newStatus;
    console.log(
      'Order status updated in mock list by seller:',
      this.mockOrders[orderIndex]
    );
    // Gerçek uygulamada belki sadece ilgili sipariş item'larının durumu güncellenir.

    // Güncellenmiş siparişi döndür
    return of({
      ...this.mockOrders[orderIndex],
      created_at: new Date(this.mockOrders[orderIndex].created_at),
    }).pipe(delay(250));
  }
}
