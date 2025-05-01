import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service'; // AuthService import et
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  itemCount$: Observable<number>;
  isLoggedIn$: Observable<boolean>; // Giriş durumu için Observable

  constructor(
    private cartService: CartService,
    private authService: AuthService // AuthService inject et
  ) {
    this.itemCount$ = this.cartService.itemCount$;
    this.isLoggedIn$ = this.authService.isLoggedIn$; // Observable'ı servisten al
  }

  ngOnInit(): void {}

  // Logout metodunu ekle
  logout(): void {
    this.authService.logout();
  }
}
