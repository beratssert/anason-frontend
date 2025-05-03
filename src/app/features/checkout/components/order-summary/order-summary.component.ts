import { Component } from '@angular/core';
import {
  CartService,
  Cart,
  CartItem,
} from '../../../../core/services/cart.service'; // CartService ve interface'leri import et
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
  standalone: false,
})
export class OrderSummaryComponent {
  // Template'te async pipe ile kullanmak üzere Observable'ları public yap
  cart$: Observable<Cart>;
  itemCount$: Observable<number>;
  totalPrice$: Observable<number>;

  constructor(private cartService: CartService) {
    this.cart$ = this.cartService.cart$;
    this.itemCount$ = this.cartService.itemCount$;
    this.totalPrice$ = this.cartService.totalPrice$;
  }

  // Sepetteki ürünler için trackBy fonksiyonu (performans için *ngFor'da kullanılır)
  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }
}
