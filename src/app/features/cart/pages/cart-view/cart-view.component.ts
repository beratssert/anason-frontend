import { Component, OnInit } from '@angular/core';
import {
  CartService,
  CartItem,
  Cart,
} from '../../../../core/services/cart.service'; // Servisi ve interface'leri import et
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.css'],
  standalone: false,
})
export class CartViewComponent implements OnInit {
  // Observable'ları template'te async pipe ile kullanmak için
  cart$: Observable<Cart>;
  itemCount$: Observable<number>;
  totalPrice$: Observable<number>;

  // Veya doğrudan abone olup değişkenlere atayabiliriz:
  // cartItems: CartItem[] = [];
  // itemCount: number = 0;
  // totalPrice: number = 0;
  // private cartSubscription: Subscription | null = null; // Unsubscribe için

  constructor(private cartService: CartService) {
    // Observable'ları servisten al
    this.cart$ = this.cartService.cart$;
    this.itemCount$ = this.cartService.itemCount$;
    this.totalPrice$ = this.cartService.totalPrice$;
  }

  ngOnInit(): void {
    // Eğer observable yerine doğrudan abone olmayı tercih edersen:
    // this.cartSubscription = this.cart$.subscribe(cart => this.cartItems = cart.items);
    // this.itemCountSubscription = this.itemCount$.subscribe(count => this.itemCount = count);
    // this.totalPriceSubscription = this.totalPrice$.subscribe(price => this.totalPrice = price);
  }

  // ngOnDestroy(): void {
  // Eğer manuel abone olduysan, component destroy olduğunda unsubscribe yapmayı unutma
  // this.cartSubscription?.unsubscribe();
  // this.itemCountSubscription?.unsubscribe();
  // this.totalPriceSubscription?.unsubscribe();
  // }

  // Miktarı artırma
  increaseQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.productId, item.quantity + 1);
  }

  // Miktarı azaltma
  decreaseQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.productId, item.quantity - 1); // Servis 0'ı kontrol edip siler
  }

  // Ürünü sepetten kaldırma
  removeFromCart(item: CartItem): void {
    if (
      confirm(`Are you sure you want to remove ${item.name} from the cart?`)
    ) {
      this.cartService.removeItem(item.productId);
    }
  }

  // Sepeti temizleme
  clearCart(): void {
    if (confirm('Are you sure you want to clear the entire cart?')) {
      this.cartService.clearCart();
    }
  }
}
