import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

// Interface'ler (Gerekirse ayrı bir dosyaya taşınabilir)
export interface AdminManagedUser {
  id: number;
  username?: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SELLER';
  status: 'ACTIVE' | 'BANNED';
  created_at: Date | string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly PRODUCT_STORAGE_KEY = 'anason_mock_products';

  // Mock data (Reviews, Attributes, Values şimdilik localStorage'a yazılmıyor)
  private mockReviews: any[] = [
    {
      id: 101,
      product_id: 1,
      user_id: 201,
      username: 'Alice',
      rating: 5,
      comment: 'Excellent smartwatch, battery life is amazing!',
      created_at: new Date('2024-04-25T10:30:00'),
    },
    {
      id: 102,
      product_id: 3,
      user_id: 202,
      username: 'Bob',
      rating: 4,
      comment: 'Great sound quality, but a bit pricey.',
      created_at: new Date('2024-04-22T14:00:00'),
    },
    {
      id: 103,
      product_id: 1,
      user_id: 203,
      username: 'Charlie',
      rating: 4,
      comment:
        'Lots of features, still exploring them all. Happy with the purchase.',
      created_at: new Date('2024-04-26T09:15:00'),
    },
    {
      id: 104,
      product_id: 2,
      user_id: 201,
      username: 'Alice',
      rating: 5,
      comment: 'Very soft and comfortable t-shirt. Fits perfectly.',
      created_at: new Date('2024-04-18T11:00:00'),
    },
    {
      id: 105,
      product_id: 4,
      user_id: 204,
      username: 'David',
      rating: 3,
      comment: 'Mugs look nice, but one arrived chipped.',
      created_at: new Date('2024-04-01T16:45:00'),
    },
    {
      id: 106,
      product_id: 3,
      user_id: 201,
      username: 'Alice',
      rating: 5,
      comment: 'Noise cancellation works wonders on my commute!',
      created_at: new Date('2024-04-28T08:00:00'),
    },
  ];
  private mockAttributes: any[] = [
    { id: 1, name: 'Color', data_type: 'STRING', category: 'Clothing' },
    { id: 2, name: 'Size', data_type: 'STRING', category: 'Clothing' },
    { id: 3, name: 'Material', data_type: 'STRING', category: 'Clothing' },
    {
      id: 4,
      name: 'Screen Size (inch)',
      data_type: 'DECIMAL',
      category: 'Electronics',
    },
    {
      id: 5,
      name: 'Water Resistance',
      data_type: 'STRING',
      category: 'Electronics',
    },
    {
      id: 6,
      name: 'Capacity (ml)',
      data_type: 'INTEGER',
      category: 'Home & Garden',
    },
    {
      id: 7,
      name: 'Bluetooth Version',
      data_type: 'STRING',
      category: 'Electronics',
    },
    {
      id: 8,
      name: 'Sole Material',
      data_type: 'STRING',
      category: 'Shoes & Bags',
    },
  ];
  private mockAttributeValues: any[] = [
    { id: 201, product_id: 1, attribute_id: 4, value: '1.78' },
    { id: 202, product_id: 1, attribute_id: 5, value: '5 ATM' },
    { id: 203, product_id: 1, attribute_id: 7, value: '5.2' },
    { id: 204, product_id: 2, attribute_id: 1, value: 'White' },
    { id: 205, product_id: 2, attribute_id: 2, value: 'M' },
    { id: 206, product_id: 2, attribute_id: 3, value: 'Organic Cotton' },
    { id: 207, product_id: 3, attribute_id: 1, value: 'Black' },
    { id: 208, product_id: 3, attribute_id: 5, value: 'IPX4' },
    { id: 209, product_id: 3, attribute_id: 7, value: '5.0' },
    { id: 210, product_id: 4, attribute_id: 6, value: '350' },
    { id: 211, product_id: 4, attribute_id: 3, value: 'Ceramic' },
    { id: 212, product_id: 5, attribute_id: 1, value: 'Blue/Gray' },
    { id: 213, product_id: 5, attribute_id: 2, value: '43' },
    { id: 214, product_id: 5, attribute_id: 8, value: 'Rubber' },
  ];

  // mockProducts artık constructor'da localStorage'dan yükleniyor
  private mockProducts: any[];

  constructor() {
    this.mockProducts = this.loadProductsFromStorage();
  }

  private loadProductsFromStorage(): any[] {
    if (typeof localStorage !== 'undefined') {
      const storedProducts = localStorage.getItem(this.PRODUCT_STORAGE_KEY);
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          if (Array.isArray(parsedProducts)) {
            return parsedProducts.map((p) => ({
              ...p,
              created_at: p.created_at ? new Date(p.created_at) : undefined,
            }));
          } else {
            localStorage.removeItem(this.PRODUCT_STORAGE_KEY);
          }
        } catch (e) {
          console.error('Error parsing products from localStorage', e);
          localStorage.removeItem(this.PRODUCT_STORAGE_KEY);
        }
      }
    }
    return this.getDefaultMockProducts();
  }

  private saveProductsToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          this.PRODUCT_STORAGE_KEY,
          JSON.stringify(this.mockProducts)
        );
      } catch (e) {
        console.error('Error saving products to localStorage', e);
      }
    }
  }

  private getDefaultMockProducts(): any[] {
    return [
      {
        id: 1,
        seller_id: 101,
        name: 'Smartwatch Pro X',
        description: 'Latest generation smartwatch...',
        price: 199.99,
        stock_quantity: 50,
        category: 'Electronics',
        image_url: 'assets/images/placeholder.png',
        created_at: new Date('2024-04-20'),
      },
      {
        id: 2,
        seller_id: 102,
        name: 'Organic Cotton T-Shirt',
        description: 'Comfortable and sustainable t-shirt...',
        price: 25.5,
        stock_quantity: 120,
        category: 'Clothing',
        image_url: 'assets/images/placeholder.png',
        created_at: new Date('2024-04-15'),
      },
      {
        id: 3,
        seller_id: 101,
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immersive sound experience...',
        price: 149.0,
        stock_quantity: 30,
        category: 'Electronics',
        image_url: 'assets/images/placeholder.png',
        created_at: new Date('2024-04-10'),
      },
      {
        id: 4,
        seller_id: 103,
        name: 'Ceramic Coffee Mug Set (Set of 4)',
        description: 'Stylish and durable ceramic mugs...',
        price: 35.99,
        stock_quantity: 80,
        category: 'Home & Garden',
        image_url: 'assets/images/placeholder.png',
        created_at: new Date('2024-03-25'),
      },
      {
        id: 5,
        seller_id: 102,
        name: 'Running Shoes - Model Runner',
        description: 'Lightweight and breathable running shoes...',
        price: 89.9,
        stock_quantity: 0,
        category: 'Shoes & Bags',
        image_url: 'assets/images/placeholder.png',
        created_at: new Date('2024-03-11'),
      },
      {
        id: 6,
        seller_id: 101,
        name: 'Smartphone Holder Grip',
        description: 'Secure phone grip and stand.',
        price: 9.99,
        stock_quantity: 200,
        category: 'Electronics',
        image_url: 'assets/images/placeholder.png',
        created_at: new Date('2024-05-01'),
      },
      {
        id: 7,
        seller_id: 102,
        name: 'Bamboo Cutting Board',
        description: 'Eco-friendly and durable cutting board.',
        price: 19.95,
        stock_quantity: 65,
        category: 'Home & Garden',
        image_url: 'assets/images/placeholder.png',
        created_at: new Date('2024-04-28'),
      },
    ];
  }

  getProducts(): Observable<any[]> {
    return of(this.mockProducts).pipe(delay(100));
  }

  getProductById(id: number): Observable<any | undefined> {
    const product = this.mockProducts.find((p) => p.id === id);
    return of(product).pipe(delay(100));
  }

  getReviewsByProductId(productId: number): Observable<any[]> {
    const reviews = this.mockReviews.filter((r) => r.product_id === productId);
    return of(reviews).pipe(delay(150));
  }

  getAttributesByProductId(productId: number): Observable<any[]> {
    const attributeValues = this.mockAttributeValues.filter(
      (val) => val.product_id === productId
    );
    const productAttributes = attributeValues.map((val) => {
      const attribute = this.mockAttributes.find(
        (attr) => attr.id === val.attribute_id
      );
      return {
        name: attribute ? attribute.name : 'Unknown Attribute',
        value: val.value,
      };
    });
    return of(productAttributes).pipe(delay(50));
  }

  addReview(reviewData: {
    productId: number;
    userId: number;
    rating: number;
    comment: string;
  }): Observable<any> {
    const newReviewId = Math.max(0, ...this.mockReviews.map((r) => r.id)) + 1;
    const newReview = {
      id: newReviewId,
      product_id: reviewData.productId,
      user_id: reviewData.userId,
      username: `User_${reviewData.userId}`,
      rating: reviewData.rating,
      comment: reviewData.comment,
      created_at: new Date(),
    };
    this.mockReviews.push(newReview);
    return of(newReview).pipe(delay(200));
  }

  getFilterOptions(): Observable<{
    categories: string[];
    priceRange: { min: number; max: number };
  }> {
    const categories = [
      ...new Set(this.mockProducts.map((p) => p.category)),
    ].sort();
    const prices = this.mockProducts.map((p) => p.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const filterOptions = {
      categories: categories,
      priceRange: { min: minPrice, max: maxPrice },
    };
    return of(filterOptions).pipe(delay(80));
  }

  getProductsBySellerId(sellerId: number): Observable<any[]> {
    const sellerProducts = this.mockProducts.filter(
      (p) => p.seller_id === sellerId
    );
    return of(sellerProducts).pipe(delay(50));
  }

  deleteProduct(productId: number, sellerId: number): Observable<boolean> {
    const initialLength = this.mockProducts.length;
    this.mockProducts = this.mockProducts.filter(
      (p) => !(p.id === productId && p.seller_id === sellerId)
    );
    if (this.mockProducts.length < initialLength) {
      this.saveProductsToStorage();
      return of(true).pipe(delay(300));
    } else {
      return of(false).pipe(delay(300));
    }
  }

  deleteProductByIdAsAdmin(productId: number): Observable<boolean> {
    console.log(
      `ProductService (Mock): [ADMIN] Attempting to delete product ${productId}`
    );
    const initialLength = this.mockProducts.length;
    this.mockProducts = this.mockProducts.filter((p) => p.id !== productId); // Sadece ID ile filtrele

    if (this.mockProducts.length < initialLength) {
      this.saveProductsToStorage(); // Değişikliği kaydet
      console.log(`Product ${productId} deleted successfully by Admin.`);
      return of(true).pipe(delay(300));
    } else {
      console.error(`[ADMIN] Product ${productId} not found for deletion.`);
      return of(false).pipe(delay(300));
    }
  }

  addProduct(productData: any, sellerId: number): Observable<any> {
    const newId =
      this.mockProducts.length > 0
        ? Math.max(...this.mockProducts.map((p) => p.id)) + 1
        : 1;
    const newProduct = {
      id: newId,
      seller_id: sellerId,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock_quantity: productData.stock_quantity,
      category: productData.category,
      image_url: productData.image_url || 'assets/images/placeholder.png',
      created_at: new Date(),
    };
    this.mockProducts.push(newProduct);
    this.saveProductsToStorage();
    return of(newProduct).pipe(delay(400));
  }

  updateProduct(
    productId: number,
    productData: any,
    sellerId: number
  ): Observable<any | null> {
    const productIndex = this.mockProducts.findIndex(
      (p) => p.id === productId && p.seller_id === sellerId
    );
    if (productIndex > -1) {
      const existingProduct = this.mockProducts[productIndex];
      const updatedProduct = {
        ...existingProduct,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        category: productData.category,
        image_url: productData.image_url || existingProduct.image_url,
      };
      this.mockProducts[productIndex] = updatedProduct;
      this.saveProductsToStorage();
      return of(updatedProduct).pipe(delay(400));
    } else {
      return of(null).pipe(delay(400));
    }
  }
}
