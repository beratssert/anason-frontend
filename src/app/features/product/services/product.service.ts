import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

// Gerekirse interface'ler buraya veya ayrı bir dosyaya taşınabilir
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
  private mockProducts: any[] = [
    {
      id: 1,
      seller_id: 101,
      name: 'Smartwatch Pro X',
      description:
        'Latest generation smartwatch with advanced health tracking.',
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
      description:
        'Comfortable and sustainable t-shirt made from 100% organic cotton.',
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
      description: 'Immersive sound experience with active noise cancellation.',
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
      description:
        'Stylish and durable ceramic mugs, perfect for your morning coffee.',
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
      description:
        'Lightweight and breathable running shoes for optimal performance.',
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

  constructor() {}

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
    return of(sellerProducts).pipe(delay(250));
  }

  deleteProduct(productId: number, sellerId: number): Observable<boolean> {
    const initialLength = this.mockProducts.length;
    this.mockProducts = this.mockProducts.filter(
      (p) => !(p.id === productId && p.seller_id === sellerId)
    );
    if (this.mockProducts.length < initialLength) {
      return of(true).pipe(delay(300));
    } else {
      return of(false).pipe(delay(300));
    }
  }

  addProduct(productData: any, sellerId: number): Observable<any> {
    const newId = Math.max(0, ...this.mockProducts.map((p) => p.id)) + 1;
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
    console.log('Product added to mock list:', newProduct);
    console.log('Updated mock products:', this.mockProducts);
    return of(newProduct).pipe(delay(400));
  }

  updateProduct(
    productId: number,
    productData: any,
    sellerId: number
  ): Observable<any | null> {
    console.log(
      `ProductService (Mock): Attempting to update product ${productId} for seller ${sellerId}`,
      productData
    );
    const productIndex = this.mockProducts.findIndex(
      (p) => p.id === productId && p.seller_id === sellerId
    );

    if (productIndex > -1) {
      // Güncellenecek ürünü al ve yeni verilerle birleştir
      const updatedProduct = {
        ...this.mockProducts[productIndex], // Mevcut verileri koru (id, seller_id, created_at)
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        category: productData.category,
        image_url:
          productData.image_url || this.mockProducts[productIndex].image_url, // URL boşsa eskisini koru
        // created_at güncellenmez, updated_at eklenebilir
      };
      this.mockProducts[productIndex] = updatedProduct; // Dizideki ürünü güncelle
      console.log('Product updated in mock list:', updatedProduct);
      console.log('Updated mock products:', this.mockProducts);
      return of(updatedProduct).pipe(delay(400)); // Güncellenmiş ürünü döndür
    } else {
      console.error(
        `Product ${productId} not found or does not belong to seller ${sellerId}.`
      );
      return of(null).pipe(delay(400)); // Bulunamadıysa null döndür
    }
  }
}
