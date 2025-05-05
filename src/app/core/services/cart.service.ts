// project/anason-frontend/src/app/core/services/cart.service.ts
import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  EMPTY,
  of,
  timer,
} from 'rxjs'; // timer ve of import edildi
import {
  map,
  catchError,
  finalize,
  tap,
  filter,
  distinctUntilChanged,
} from 'rxjs/operators'; // distinctUntilChanged eklendi
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// --- Interfaces ---
export interface CartItem {
  id: number; // Cart Item ID from backend
  productId: number;
  productName: string; // Backend DTO'sundan gelmeli
  price: number; // Backend DTO'sundan gelmeli
  quantity: number;
  imageUrl?: string; // Backend DTO'sundan gelmeli
}
export interface Cart {
  items: CartItem[];
}
// Backend DTO'sunun da bu alanları içerdiğini varsayıyoruz
interface CartItemDTO {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price?: number;
  imageUrl?: string;
}
// ------------------

@Injectable({
  providedIn: 'root',
})
export class CartService implements OnDestroy {
  private apiUrl = environment.apiUrl;
  private cartSubject = new BehaviorSubject<Cart>({ items: [] });
  cart$: Observable<Cart> = this.cartSubject.asObservable();
  itemCount$: Observable<number> = this.cart$.pipe(
    map((cart) => cart.items.reduce((sum, item) => sum + item.quantity, 0))
  );
  totalPrice$: Observable<number> = this.cart$.pipe(
    map((cart) =>
      cart.items.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      )
    )
  );

  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private authStatusSubscription: Subscription;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor() {
    console.log('CartService Initialized - Simplified Constructor Logic');

    // Kullanıcı giriş/çıkışını dinle
    this.authStatusSubscription = this.authService.isLoggedIn$
      .pipe(
        distinctUntilChanged(), // Sadece durum değiştiğinde tetikle
        tap((isLoggedIn) =>
          console.log(`CartService: Auth status changed to: ${isLoggedIn}`)
        )
      )
      .subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          // Giriş yapıldığında SEPETİ YENİLE (Gecikme kaldırıldı)
          console.log(
            'CartService: Login detected, refreshing cart state IMMEDIATELY.'
          );
          this.refreshCartState().subscribe(
            () =>
              console.log(
                'CartService: Initial cart refresh after login complete.'
              ),
            (err) =>
              console.error(
                'CartService: Error during initial cart refresh after login:',
                err
              )
          );
        } else {
          // Çıkış yapıldığında sepet state'ini temizle
          console.log('CartService: Logout detected, clearing cart state.');
          this.cartSubject.next({ items: [] });
        }
      });

    // --- İLK YÜKLEME KONTROLÜ ---
    // Servis ilk yüklendiğinde kullanıcı zaten giriş yapmışsa sepeti çek.
    if (this.authService.isLoggedIn) {
      console.log(
        'CartService: Initial check - User is already logged in. Refreshing cart.'
      );
      this.refreshCartState().subscribe();
    } else {
      console.log('CartService: Initial check - User is not logged in.');
    }
    // --- İLK YÜKLEME KONTROLÜ SONU ---
  }

  ngOnDestroy(): void {
    this.authStatusSubscription?.unsubscribe();
  }

  // Sepeti backend'den çekip state'i güncelleyen private metot
  refreshCartState(): Observable<Cart> {
    if (!this.authService.getToken()) {
      console.warn(
        'CartService: refreshCartState skipped - No auth token found.'
      );
      this.cartSubject.next({ items: [] });
      return of({ items: [] });
    }
    // isLoading kontrolü kaldırıldı
    // if (this.isLoading.value) { /* ... */ }

    this.isLoading.next(true);
    const url = `${this.apiUrl}/cart/my-cart`;
    console.log(`CartService: Refreshing cart state from: ${url}`);

    return this.httpClient.get<CartItemDTO[]>(url).pipe(
      tap((dtos) =>
        console.log('CartService: Received DTOs from backend:', dtos)
      ),
      map((dtos) => {
        const items: CartItem[] = dtos.map((dto) => ({
          id: dto.id,
          productId: dto.productId,
          productName: dto.productName ?? 'N/A',
          quantity: dto.quantity,
          price: dto.price ?? 0,
          imageUrl: dto.imageUrl,
        }));
        const newCart = { items };
        console.log(
          'CartService: Cart state updated with items:',
          items.length
        );
        this.cartSubject.next(newCart);
        return newCart;
      }),
      catchError((error) => {
        console.error('CartService: Error refreshing cart state:', error);
        this.cartSubject.next({ items: [] });
        return of({ items: [] });
      }),
      finalize(() => {
        console.log('CartService: refreshCartState finalized.');
        this.isLoading.next(false);
      })
    );
  }

  // Ürün ekleme
  addItem(productId: number, quantity: number = 1): void {
    if (!productId || quantity <= 0) {
      this.toastr.error('Invalid product or quantity.', 'Error');
      return;
    }
    if (!this.authService.isLoggedIn) {
      this.toastr.warning(
        'Please log in to add items to your cart.',
        'Login Required'
      );
      return;
    }

    this.isLoading.next(true);
    const url = `${this.apiUrl}/cart/add`;
    const params = new HttpParams()
      .set('productId', productId.toString())
      .set('quantity', quantity.toString());
    console.log(
      `CartService: Attempting POST to: ${url} with params:`,
      params.toString()
    );

    this.httpClient
      .post(url, null, { params, responseType: 'text' })
      .pipe(
        catchError((error) => {
          console.error('Error adding item to cart:', error);
          const errorMsg = this.extractErrorMessage(error);
          this.toastr.error(errorMsg, 'Error');
          return EMPTY;
        }),
        finalize(() => this.isLoading.next(false))
      )
      .subscribe(() => {
        console.log(`CartService: Item ${productId} added, refreshing cart...`);
        this.refreshCartState().subscribe();
      });
  }

  // Miktar güncelleme
  updateItemQuantity(cartItemId: number, newQuantity: number): void {
    if (!cartItemId || newQuantity < 0) {
      this.toastr.error('Invalid item or quantity.', 'Error');
      console.error(
        'updateItemQuantity called with invalid args:',
        cartItemId,
        newQuantity
      );
      return;
    }
    if (newQuantity === 0) {
      this.removeItem(cartItemId);
      return;
    }
    if (!this.authService.isLoggedIn) {
      this.toastr.warning(
        'Please log in to modify your cart.',
        'Login Required'
      );
      return;
    }

    this.isLoading.next(true);
    const url = `${this.apiUrl}/cart/update/${cartItemId}`;
    const params = new HttpParams().set('quantity', newQuantity.toString());
    console.log(
      `CartService: Attempting PUT request to: ${url} with params:`,
      params.toString()
    );

    this.httpClient
      .put(url, null, { params, responseType: 'text' })
      .pipe(
        catchError((error) => {
          console.error('Error updating cart item quantity:', error);
          const errorMsg = this.extractErrorMessage(error);
          this.toastr.error(errorMsg, 'Error');
          // Hata durumunda da loading state'ini false yapmalıyız.
          // finalize bloğu bunu zaten yapacak.
          return EMPTY;
        })
        // finalize(() => this.isLoading.next(false)) // refreshCartState içinde finalize var
      )
      .subscribe(() => {
        console.log(
          `CartService: PUT request for item ${cartItemId} quantity update SUCCEEDED.`
        );
        console.log(`CartService: Now calling refreshCartState().`);
        this.refreshCartState().subscribe(() => {
          console.log(
            `CartService: refreshCartState completed AFTER quantity update for item ${cartItemId}.`
          );
        });
      });
  }

  // Ürün silme
  removeItem(cartItemId: number): void {
    if (!cartItemId) {
      console.error('removeItem called with invalid cartItemId:', cartItemId);
      return;
    }
    if (!this.authService.isLoggedIn) {
      this.toastr.warning(
        'Please log in to modify your cart.',
        'Login Required'
      );
      return;
    }

    this.isLoading.next(true);
    const url = `${this.apiUrl}/cart/remove/${cartItemId}`;
    console.log(`CartService: Attempting DELETE request to: ${url}`);

    this.httpClient
      .delete(url, { responseType: 'text' })
      .pipe(
        catchError((error) => {
          console.error('Error removing item from cart:', error);
          const errorMsg = this.extractErrorMessage(error);
          this.toastr.error(errorMsg, 'Error');
          return EMPTY;
        }),
        finalize(() => this.isLoading.next(false))
      )
      .subscribe(() => {
        console.log(
          `CartService: Item ${cartItemId} removed, refreshing cart...`
        );
        this.refreshCartState().subscribe();
      });
  }

  // Sepeti temizleme
  clearCart(): void {
    if (!this.authService.isLoggedIn) {
      this.toastr.warning(
        'Please log in to modify your cart.',
        'Login Required'
      );
      return;
    }

    this.isLoading.next(true);
    const url = `${this.apiUrl}/cart/clear`;
    console.log('CartService: Clearing cart:', url);

    this.httpClient
      .delete(url, { responseType: 'text' })
      .pipe(
        catchError((error) => {
          console.error('Error clearing cart:', error);
          const errorMsg = this.extractErrorMessage(error);
          this.toastr.error(errorMsg, 'Error');
          return EMPTY;
        }),
        finalize(() => this.isLoading.next(false))
      )
      .subscribe(() => {
        console.log('CartService: Cart cleared, refreshing state...');
        this.refreshCartState().subscribe();
      });
  }

  // Checkout
  checkout(): Observable<boolean> {
    if (!this.authService.isLoggedIn) {
      this.toastr.warning(
        'Please log in to proceed to checkout.',
        'Login Required'
      );
      return of(false);
    }
    if (this.cartSubject.getValue().items.length === 0) {
      this.toastr.warning('Your cart is empty.', 'Cannot Checkout');
      return of(false);
    }

    this.isLoading.next(true);
    const url = `${this.apiUrl}/cart/checkout`;
    console.log('CartService: Initiating checkout:', url);

    return this.httpClient
      .post<{ message?: string; orderId?: number } | string>(url, {})
      .pipe(
        map((response) => {
          console.log('CartService: Checkout response:', response);
          const message =
            typeof response === 'string' ? response : response?.message;
          this.toastr.success(
            message || 'Order created successfully!',
            'Checkout Success'
          );
          this.refreshCartState().subscribe(); // Sepeti temizle
          // TODO: Ödeme sayfasına yönlendirme (orderId ile?)
          // const orderId = (typeof response !== 'string') ? response?.orderId : null;
          // if (orderId) { this.router.navigate(['/payment', orderId]); }
          return true;
        }),
        catchError((error) => {
          console.error('Error during checkout:', error);
          const errorMsg = this.extractErrorMessage(error);
          this.toastr.error(errorMsg, 'Checkout Error');
          return of(false);
        }),
        finalize(() => this.isLoading.next(false))
      );
  }

  // Helper: Hata mesajını ayıklama
  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.error) {
      return error.error.error;
    }
    if (typeof error.error === 'string') {
      return error.error;
    }
    return error.message || 'An unknown error occurred.';
  }
}
