import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: false,
})
export class ProductListComponent implements OnInit, OnDestroy {
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
  currentSearchTerm: string | null = null;

  private queryParamSubscription: Subscription | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

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
        // Sadece arama terimi değiştiyse veya ilk yüklemeden farklıysa filtrele
        if (this.currentSearchTerm !== newSearchTerm) {
          this.currentSearchTerm = newSearchTerm;
          console.log('Search term from route:', this.currentSearchTerm);
          // isLoading true ise filtreleme loadInitialData içinde yapılacak
          if (!this.isLoading) {
            this.applyFiltersAndSort();
          }
        }
      }
    );
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
      // Başlangıç filtrelemesi (URL'den gelen arama terimini de içerecek)
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
    let tempProducts = this.products;

    // 1. Search Term Filtresi (İsim VEYA Kategori)
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

    // 2. Kategori Filtresi
    if (this.selectedCategory) {
      tempProducts = tempProducts.filter(
        (product) => product.category === this.selectedCategory
      );
    }

    // 3. Fiyat Filtresi
    // Inputlardan gelen değerlerin sayı olduğundan emin olalım
    const minPrice =
      Number(this.currentMinPrice) || this.filterOptions.priceRange.min || 0;
    const maxPrice =
      Number(this.currentMaxPrice) ||
      this.filterOptions.priceRange.max ||
      Infinity;
    tempProducts = tempProducts.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );

    this.filteredProducts = tempProducts;
    this.sortProducts(); // Filtrelenmiş sonucu sırala
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
    // Sıralama sonrası dizinin referansını değiştirmek *bazen* gerekir, test edilebilir:
    // this.filteredProducts = [...this.filteredProducts];
  }

  addToCart(product: any): void {
    this.cartService.addItem(product, 1);
    this.toastr.success(`${product.name} added to cart!`, 'Success');
  }
}
