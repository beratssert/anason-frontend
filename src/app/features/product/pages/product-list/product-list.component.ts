import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
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

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      products: this.productService.getProducts(),
      filters: this.productService.getFilterOptions(),
    }).subscribe(({ products, filters }) => {
      this.products = products;
      this.filterOptions = filters;
      this.currentMinPrice = filters.priceRange.min;
      this.currentMaxPrice = filters.priceRange.max;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  selectCategory(category: string | null): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter((product) => {
      const categoryMatch =
        !this.selectedCategory || product.category === this.selectedCategory;
      const priceMatch =
        product.price >= this.currentMinPrice &&
        product.price <= this.currentMaxPrice;
      return categoryMatch && priceMatch;
    });
  }
}
