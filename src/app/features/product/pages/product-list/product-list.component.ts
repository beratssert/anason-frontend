import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr'; // ToastrService eklendi
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: false,
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  isLoading: boolean = true;

  filterOptions: {
    categories: string[];
    priceRange: { min: number; max: number };
  } = {
    categories: [],
    priceRange: { min: 0, max: 0 },
  };
  selectedCategory: string | null = null;
  currentMinPrice: number = 0;
  currentMaxPrice: number = 0;
  currentSortOrder: string = 'default';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService // ToastrService inject edildi
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      products: this.productService.getProducts(),
      filters: this.productService.getFilterOptions(),
    }).subscribe(({ products, filters }) => {
      this.products = products.map((p) => ({
        ...p,
        created_at: new Date(p.created_at),
      }));
      this.filterOptions = filters;
      this.currentMinPrice = filters.priceRange.min;
      this.currentMaxPrice = filters.priceRange.max;
      this.applyFiltersAndSort();
      this.isLoading = false;
    });
  }

  selectCategory(category: string | null): void {
    this.selectedCategory = category;
    this.applyFiltersAndSort();
  }

  onPriceChange(): void {
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.sortProducts();
  }

  applyFiltersAndSort(): void {
    let tempProducts = this.products.filter((product) => {
      const categoryMatch =
        !this.selectedCategory || product.category === this.selectedCategory;
      const priceMatch =
        product.price >= this.currentMinPrice &&
        product.price <= this.currentMaxPrice;
      return categoryMatch && priceMatch;
    });
    this.filteredProducts = tempProducts;
    this.sortProducts();
  }

  sortProducts(): void {
    if (!this.filteredProducts) return;

    this.filteredProducts.sort((a, b) => {
      switch (this.currentSortOrder) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
          return b.created_at.getTime() - a.created_at.getTime();
        case 'default':
        default:
          return a.id - b.id;
      }
    });
  }

  addToCart(product: any): void {
    this.cartService.addItem(product, 1);
    this.toastr.success(`${product.name} added to cart!`, 'Success'); // Toastr bildirimi
  }
}
