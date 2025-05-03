// src/app/core/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Router import et
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  itemCount$: Observable<number>;
  isLoggedIn$: Observable<boolean>;
  searchTerm: string = ''; // Arama terimini tutacak değişken

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router // Router inject et
  ) {
    this.itemCount$ = this.cartService.itemCount$;
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }

  // Arama yapıldığında çalışacak metot
  searchProducts(): void {
    if (this.searchTerm.trim()) {
      // Eğer arama terimi boş değilse, products sayfasına query parametresi ile git
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchTerm.trim() },
      });
    } else {
      // Arama terimi boşsa, query parametresi olmadan products sayfasına git (tüm ürünleri göster)
      this.router.navigate(['/products']);
    }
  }
}
