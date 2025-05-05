import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// --- INTERFACES ---
export interface Product {
  id: number;
  seller_id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category?: string;
  image_url?: string;
  created_at?: Date | string;
}

export interface Review {
  id: number;
  user_id: number;
  username?: string;
  rating: number;
  comment: string;
  created_at: Date | string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductFilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
}

export interface AddReviewPayload {
  rating: number;
  comment: string;
}

export type ProductPayload = Omit<Product, 'id' | 'created_at' | 'seller_id'>;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);

  constructor() {}

  // --- Public Product Methods ---

  getProducts(): Observable<Product[]> {
    const url = `${this.apiUrl}/products`;
    return this.httpClient.get<Product[]>(url).pipe(
      map((products) => products.map(this.mapProductDates)),
      catchError(this.handleError)
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    const url = `${this.apiUrl}/products/${id}`;
    return this.httpClient.get<Product>(url).pipe(
      map(this.mapProductDates),
      catchError((error) => {
        if (error.status === 404) {
          return of(undefined);
        }
        return this.handleError(error);
      })
    );
  }

  getReviewsByProductId(productId: number): Observable<Review[]> {
    // Varsayım: Backend endpoint -> GET /api/products/{productId}/reviews
    const url = `${this.apiUrl}/products/${productId}/reviews`;
    return this.httpClient.get<Review[]>(url).pipe(
      map((reviews) =>
        reviews.map((r) => ({ ...r, created_at: new Date(r.created_at) }))
      ),
      catchError(this.handleError)
    );
  }

  getAttributesByProductId(productId: number): Observable<ProductAttribute[]> {
    // Varsayım: Backend endpoint -> GET /api/products/{productId}/attributes
    const url = `${this.apiUrl}/products/${productId}/attributes`;
    return this.httpClient
      .get<ProductAttribute[]>(url)
      .pipe(catchError(this.handleError));
  }

  addReview(
    productId: number,
    reviewData: AddReviewPayload
  ): Observable<Review> {
    // Varsayım: Backend endpoint -> POST /api/products/{productId}/reviews (Auth Gerekli)
    const url = `${this.apiUrl}/products/${productId}/reviews`;
    return this.httpClient.post<Review>(url, reviewData).pipe(
      map((r) => ({ ...r, created_at: new Date(r.created_at) })),
      catchError(this.handleError)
    );
  }

  getFilterOptions(): Observable<ProductFilterOptions> {
    // Varsayım: Backend endpoint -> GET /api/products/filters
    const url = `${this.apiUrl}/products/filters`;
    const defaultOptions: ProductFilterOptions = {
      categories: [],
      priceRange: { min: 0, max: 1000 },
    };
    return this.httpClient.get<ProductFilterOptions>(url).pipe(
      catchError((err) => {
        console.error(
          'Error fetching filter options, returning defaults.',
          err
        );
        return of(defaultOptions);
      })
    );
  }

  // --- SELLER Methods ---

  getProductsBySellerId(): Observable<Product[]> {
    // Varsayım: Backend endpoint -> GET /api/seller/products (Auth Gerekli)
    // Backend token'dan sellerId'yi almalı
    const url = `${this.apiUrl}/seller/products`;
    return this.httpClient.get<Product[]>(url).pipe(
      map((products) => products.map(this.mapProductDates)),
      catchError(this.handleError)
    );
  }

  addProduct(productData: ProductPayload): Observable<Product> {
    // Endpoint: POST /api/seller/product-create (Auth Gerekli)
    const url = `${this.apiUrl}/seller/product-create`;
    return this.httpClient
      .post<Product>(url, productData)
      .pipe(map(this.mapProductDates), catchError(this.handleError));
  }

  updateProduct(
    productId: number,
    productData: Partial<ProductPayload>
  ): Observable<Product> {
    // Endpoint: PUT /api/seller/product-update/{id} (Auth Gerekli)
    const url = `${this.apiUrl}/seller/product-update/${productId}`;
    return this.httpClient
      .put<Product>(url, productData)
      .pipe(map(this.mapProductDates), catchError(this.handleError));
  }

  deleteProduct(productId: number): Observable<void> {
    // Endpoint: DELETE /api/seller/product-delete/{id} (Auth Gerekli)
    const url = `${this.apiUrl}/seller/product-delete/${productId}`;
    return this.httpClient.delete<void>(url).pipe(catchError(this.handleError));
  }

  // --- ADMIN Methods ---

  updateProductAsAdmin(
    productId: number,
    productData: Partial<ProductPayload>
  ): Observable<Product> {
    // Varsayım: Backend endpoint -> PUT /api/admin/products/{id} (Auth Gerekli)
    // VEYA Seller endpoint'i kullanılacaksa backend yetki kontrolü yapmalı.
    const url = `${this.apiUrl}/admin/products/${productId}`; // Gerekirse düzeltin
    return this.httpClient
      .put<Product>(url, productData)
      .pipe(map(this.mapProductDates), catchError(this.handleError));
  }

  deleteProductByIdAsAdmin(productId: number): Observable<void> {
    // Endpoint: DELETE /api/admin/product/{id} (Auth Gerekli)
    const url = `${this.apiUrl}/admin/product/${productId}`;
    return this.httpClient.delete<void>(url).pipe(catchError(this.handleError));
  }

  // --- HELPER Methods ---

  private mapProductDates(product: Product): Product {
    return {
      ...product,
      created_at: product.created_at ? new Date(product.created_at) : undefined,
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Backend returned code ${error.status}. `;
      if (error.error?.message) {
        errorMessage += `Message: ${error.error.message}`;
      } else if (error.error?.error) {
        errorMessage += `Error: ${error.error.error}`;
      } else if (typeof error.error === 'string') {
        errorMessage += `Details: ${error.error}`;
      } else {
        errorMessage += `Full error: ${error.message}`;
      }
    }
    console.error('API Error in ProductService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
