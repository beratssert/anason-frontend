import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ProductService,
  Product,
  ProductFilterOptions,
} from '../../services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ComparisonService } from '../../../../core/services/comparison.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: false,
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = true;
  errorLoading: string | null = null; // Tip: string | null

  filterOptions: ProductFilterOptions = {
    categories: [],
    priceRange: { min: 0, max: 0 },
  };
  selectedCategory: string | null = null;
  currentMinPrice: number = 0;
  currentMaxPrice: number = 0;
  currentSortOrder: string = 'default';
  currentSearchTerm: string | null = null;

  private queryParamSubscription: Subscription | null = null;

  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private comparisonService = inject(ComparisonService);

  ngOnInit(): void {
    this.loadInitialData();
    this.subscribeToQueryParams();
  }

  ngOnDestroy(): void {
    this.queryParamSubscription?.unsubscribe();
  }

  subscribeToQueryParams(): void {
    this.queryParamSubscription = this.route.queryParamMap.subscribe(
      (params) => {
        const newSearchTerm = params.get('search');
        if (this.currentSearchTerm !== newSearchTerm) {
          this.currentSearchTerm = newSearchTerm;
          if (!this.isLoading) {
            this.applyFiltersAndSort();
          }
        }
      }
    );
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.errorLoading = null;

    const filterOptions$ = this.productService.getFilterOptions().pipe(
      catchError((err) => {
        console.warn(
          'Could not load filter options (using defaults):',
          err.message
        );
        return of({ categories: [], priceRange: { min: 0, max: 0 } });
      })
    );

    forkJoin({
      products: this.productService.getProducts(),
      filters: filterOptions$,
    }).subscribe({
      next: ({ products, filters }) => {
        this.products = products;
        this.filterOptions = filters;
        this.currentMinPrice = filters.priceRange.min;
        this.currentMaxPrice = filters.priceRange.max;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading initial product data:', err);
        this.errorLoading = err.message || 'Failed to load products.';
        // --- DÜZELTME ---
        // errorLoading null olabileceğinden, ?? operatörü ile varsayılan mesaj sağla
        this.toastr.error(
          this.errorLoading ?? 'Failed to load products.',
          'Error'
        );
        // --- DÜZELTME SONU ---
        this.isLoading = false;
        this.products = [];
        this.filteredProducts = [];
        this.filterOptions = { categories: [], priceRange: { min: 0, max: 0 } };
      },
    });
  }

  selectCategory(category: string | null): void {
    this.selectedCategory = category;
    this.applyFiltersAndSort();
  }

  onPriceChange(): void {
    if (Number(this.currentMinPrice) > Number(this.currentMaxPrice)) {
      this.currentMinPrice = this.currentMaxPrice;
    }
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.sortProducts();
  }

  applyFiltersAndSort(): void {
    let tempProducts = [...this.products];
    // this.errorLoading = null; // Hata mesajını burada sıfırlamak yerine, başarılı filtrelemede sıfırlamak daha mantıklı olabilir

    // Filtreleme işlemleri...
    // 1. Search Term Filter
    if (this.currentSearchTerm) {
      const searchTermLower = this.currentSearchTerm.toLowerCase().trim();
      if (searchTermLower) {
        tempProducts = tempProducts.filter(
          (product) =>
            product.name?.toLowerCase().includes(searchTermLower) ||
            product.category?.toLowerCase().includes(searchTermLower)
        );
      }
    }
    // 2. Category Filter
    if (this.selectedCategory) {
      tempProducts = tempProducts.filter(
        (product) => product.category === this.selectedCategory
      );
    }
    // 3. Price Filter
    const minPrice = Number(this.currentMinPrice) || 0;
    const maxPrice = Number(this.currentMaxPrice) || Infinity;
    if (minPrice <= maxPrice || maxPrice === Infinity) {
      tempProducts = tempProducts.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );
    } else {
      console.warn('Min price is greater than Max price in filter.');
    }

    this.filteredProducts = tempProducts;
    // Filtreleme başarılıysa hata mesajını temizle
    // if (this.errorLoading) this.errorLoading = null; // Opsiyonel: Hata mesajını temizleme
    this.sortProducts();
  }

  sortProducts(): void {
    if (!this.filteredProducts) return;
    this.filteredProducts = [...this.filteredProducts].sort((a, b) => {
      // Sıralama mantığı... (öncekiyle aynı)
      switch (this.currentSortOrder) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
          const dateA =
            a.created_at instanceof Date ? a.created_at.getTime() : 0;
          const dateB =
            b.created_at instanceof Date ? b.created_at.getTime() : 0;
          return dateB - dateA;
        case 'default':
        default:
          return a.id - b.id;
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product, 1);
    this.toastr.success(`${product.name} added to cart!`, 'Success');
  }

  addToCompare(productId: number, productName: string): void {
    const success = this.comparisonService.addToCompare(productId);
    if (success) {
      this.toastr.success(
        `${productName} added to comparison list.`,
        'Compare'
      );
    } else {
      this.toastr.info(
        `Could not add ${productName}. Check if it's already added or if the list is full (max 4).`,
        'Compare'
      );
    }
  }
}
