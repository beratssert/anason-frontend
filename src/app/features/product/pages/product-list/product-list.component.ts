import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: false,
})
export class ProductListComponent implements OnInit {
  products: any[] = [
    {
      id: 1,
      seller_id: 101,
      name: 'Smartwatch Pro X',
      description:
        'Latest generation smartwatch with advanced health tracking.',
      price: 199.99,
      stock_quantity: 50,
      category: 'Electronics',
      image_url: 'placeholder.jpg',
      created_at: new Date(),
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
      image_url: 'placeholder.jpg',
      created_at: new Date(),
    },
    {
      id: 3,
      seller_id: 101,
      name: 'Wireless Noise-Cancelling Headphones',
      description: 'Immersive sound experience with active noise cancellation.',
      price: 149.0,
      stock_quantity: 30,
      category: 'Electronics',
      image_url: 'placeholder.jpg',
      created_at: new Date(),
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
      image_url: 'placeholder.jpg',
      created_at: new Date(),
    },
  ];

  constructor() {}

  ngOnInit(): void {
    // API bağlantısı kurulduğunda bu sahte veri yerine servis çağrısı gelecek.
  }
}
