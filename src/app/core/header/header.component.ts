// src/app/core/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service'; // CartService'i import et
import { Observable } from 'rxjs'; // Observable'ı import et

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  itemCount$: Observable<number>; // Observable olarak tanımla

  constructor(private cartService: CartService) {
    this.itemCount$ = this.cartService.itemCount$; // Servisteki observable'ı ata
  }

  ngOnInit(): void {}
}
