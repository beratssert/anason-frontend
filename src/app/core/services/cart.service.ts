import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Sepetteki bir ürünü temsil eden interface
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// Sepetin genel durumunu temsil eden interface
export interface Cart {
  items: CartItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.loadInitialCart());
  cart$: Observable<Cart> = this.cartSubject.asObservable();

  itemCount$: Observable<number> = this.cart$.pipe(
    map((cart) => cart.items.reduce((sum, item) => sum + item.quantity, 0))
  );

  totalPrice$: Observable<number> = this.cart$.pipe(
    map((cart) =>
      cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )
  );

  constructor() {}

  private loadInitialCart(): Cart {
    if (typeof localStorage !== 'undefined') {
      const storedCart = localStorage.getItem('anason_cart');
      if (storedCart) {
        try {
          // Güvenlik için: parse edilen objenin beklenen yapıda olduğunu kontrol edebiliriz
          const parsedCart = JSON.parse(storedCart);
          if (parsedCart && Array.isArray(parsedCart.items)) {
            return parsedCart;
          } else {
            console.warn(
              'Invalid cart structure in localStorage. Resetting cart.'
            );
            localStorage.removeItem('anason_cart');
          }
        } catch (e) {
          console.error('Error parsing cart from localStorage', e);
          localStorage.removeItem('anason_cart');
        }
      }
    }
    return { items: [] };
  }

  private saveCart(cart: Cart): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('anason_cart', JSON.stringify(cart));
      this.cartSubject.next(cart); // Değişikliği her zaman yayınla
    }
  }

  addItem(product: any, quantity: number = 1): void {
    if (!product || quantity <= 0) return;

    const currentCart = this.cartSubject.getValue();
    const existingItemIndex = currentCart.items.findIndex(
      (item) => item.productId === product.id
    );

    let updatedItems: CartItem[];

    if (existingItemIndex > -1) {
      updatedItems = currentCart.items.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          // İleride burada stok kontrolü yapılabilir
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.image_url,
      };
      updatedItems = [...currentCart.items, newItem];
    }
    this.saveCart({ items: updatedItems });
  }

  updateItemQuantity(productId: number, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const currentCart = this.cartSubject.getValue();
    const updatedItems = currentCart.items.map((item) => {
      if (item.productId === productId) {
        // İleride burada stok kontrolü yapılabilir
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    this.saveCart({ items: updatedItems });
  }

  removeItem(productId: number): void {
    const currentCart = this.cartSubject.getValue();
    const updatedItems = currentCart.items.filter(
      (item) => item.productId !== productId
    );
    this.saveCart({ items: updatedItems });
  }

  clearCart(): void {
    this.saveCart({ items: [] });
  }
}
