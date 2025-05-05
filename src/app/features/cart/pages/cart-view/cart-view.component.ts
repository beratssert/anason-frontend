// project/anason-frontend/src/app/features/cart/pages/cart-view/cart-view.component.ts
import { Component, OnInit, inject } from '@angular/core';
import {
  CartService,
  CartItem,
  Cart,
} from '../../../../core/services/cart.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'; // Router eklendi (Checkout için)

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.css'],
  standalone: false,
})
export class CartViewComponent implements OnInit {
  cart$: Observable<Cart>;
  itemCount$: Observable<number>;
  totalPrice$: Observable<number>;
  isLoading$: Observable<boolean>;

  private cartService = inject(CartService);
  private router = inject(Router); // Router inject edildi

  constructor() {
    this.cart$ = this.cartService.cart$;
    this.itemCount$ = this.cartService.itemCount$;
    this.totalPrice$ = this.cartService.totalPrice$;
    this.isLoading$ = this.cartService.isLoading$;
  }

  ngOnInit(): void {
    // Component yüklendiğinde sepetin güncel halini çekmek genellikle iyidir,
    // ancak CartService constructor'da zaten yapıyor olabilir.
    // this.cartService.refreshCartState().subscribe();
  }

  // Miktar Artırma (item.id kullanılır)
  increaseQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.id, item.quantity + 1);
  }

  // Miktar Azaltma (item.id kullanılır)
  decreaseQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.id, item.quantity - 1); // Servis 0'ı kontrol edip siler
  }

  // Ürün Silme (item.id kullanılır)
  removeFromCart(item: CartItem): void {
    if (
      confirm(
        `Are you sure you want to remove ${item.productName} from the cart?`
      )
    ) {
      this.cartService.removeItem(item.id);
    }
  }

  // Sepeti Temizleme
  clearCart(): void {
    if (confirm('Are you sure you want to clear the entire cart?')) {
      this.cartService.clearCart();
    }
  }

  // Checkout işlemi
  proceedToCheckout(): void {
    console.log('Proceeding to checkout...');
    this.cartService.checkout().subscribe((success) => {
      if (success) {
        console.log('Checkout successful, order created.');
        // Başarılı sipariş sonrası siparişlerim sayfasına veya ödeme sayfasına yönlendirme
        this.router.navigate(['/orders']); // Örnek: Siparişlerim sayfasına git
      } else {
        console.log('Checkout failed or cart was empty.');
        // Hata mesajı zaten service içinde gösteriliyor olabilir (Toastr)
      }
    });
  }

  // Performans için trackBy
  trackByCartItemId(index: number, item: CartItem): number {
    return item.id; // cartItemId'ye göre track et
  }
}
