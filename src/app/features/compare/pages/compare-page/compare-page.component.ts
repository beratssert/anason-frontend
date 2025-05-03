import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ComparisonService } from '../../../../core/services/comparison.service';
import { ProductService } from '../../../../features/product/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError, filter, tap } from 'rxjs/operators';

// Karşılaştırılan ürünün detaylı tipini tanımlayalım
interface ComparedProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image_url?: string;
  stock_quantity: number;
  seller_id: number;
  created_at: Date; // Date objesi olarak tutalım
  attributes: { name: string; value: string }[]; // Özellikleri dizi olarak ekle
}

// forkJoin'dan dönen ara tip
type ProductFetchResult = { product: any | null; attributes: any[] };

@Component({
  selector: 'app-compare-page',
  templateUrl: './compare-page.component.html',
  styleUrls: ['./compare-page.component.css'],
  standalone: false,
})
export class ComparePageComponent implements OnInit, OnDestroy {
  comparedProductIds: number[] = [];
  comparedProducts: ComparedProduct[] = [];
  isLoading: boolean = true;
  errorLoading: string | null = null;
  allAttributeNames: string[] = []; // Benzersiz özellik isimleri

  private comparisonSubscription: Subscription | null = null;
  readonly maxCompareItems = 4; // Bu sayıyı ComparisonService ile senkronize tut

  constructor(
    private comparisonService: ComparisonService,
    private productService: ProductService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.comparisonSubscription = this.comparisonService.comparedProductIds$
      .pipe(
        tap((ids) => {
          this.comparedProductIds = ids;
          this.isLoading = true;
          this.comparedProducts = [];
          this.allAttributeNames = [];
          this.errorLoading = null;
          // Eğer başlangıçta ID listesi boşsa, yüklemeyi hemen bitir
          if (ids.length === 0) {
            this.isLoading = false;
          }
        }),
        filter((ids) => ids.length > 0), // Sadece ID varsa devam et
        switchMap((ids) => {
          const productObservables = ids.map((id) =>
            forkJoin({
              product: this.productService
                .getProductById(id)
                .pipe(catchError((err) => of(null))),
              attributes: this.productService
                .getAttributesByProductId(id)
                .pipe(catchError((err) => of([]))),
            })
          );
          return forkJoin(productObservables); // Tüm istekleri birleştir
        }),
        map((results: ProductFetchResult[]) => {
          // results parametresine tip ver
          const products: ComparedProduct[] = [];
          const attributeNames = new Set<string>();

          results.forEach((result) => {
            if (result.product) {
              const productWithAttributes: ComparedProduct = {
                ...result.product,
                created_at: new Date(result.product.created_at), // Date objesine çevir
                attributes: result.attributes || [],
              };
              products.push(productWithAttributes);
              productWithAttributes.attributes.forEach((attr) =>
                attributeNames.add(attr.name)
              );
            } else {
              console.warn('Could not load details for one comparison item.');
            }
          });

          return {
            products: products,
            uniqueAttributeNames: [...attributeNames].sort(),
          };
        })
      )
      .subscribe({
        next: (data) => {
          this.comparedProducts = data.products;
          this.allAttributeNames = data.uniqueAttributeNames;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading compared products:', err);
          this.toastr.error('Failed to load comparison data.', 'Error');
          this.isLoading = false;
          this.errorLoading = 'Could not load comparison data.';
        },
      });
  }

  ngOnDestroy(): void {
    this.comparisonSubscription?.unsubscribe();
  }

  removeFromCompare(productId: number): void {
    this.comparisonService.removeFromCompare(productId);
    this.toastr.info('Product removed from comparison.');
  }

  clearCompare(): void {
    if (confirm('Are you sure you want to clear the comparison list?')) {
      this.comparisonService.clearCompare();
      this.toastr.info('Comparison list cleared.');
    }
  }

  getAttributeValue(product: ComparedProduct, attributeName: string): string {
    const attribute = product.attributes.find(
      (attr) => attr.name === attributeName
    );
    return attribute ? attribute.value : '-';
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}
