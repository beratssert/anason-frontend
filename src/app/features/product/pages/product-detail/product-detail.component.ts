import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Observable, of, forkJoin } from 'rxjs'; // forkJoin eklendi/teyit edildi
import { switchMap, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: false,
})
export class ProductDetailComponent implements OnInit {
  product: any | null = null;
  reviews: any[] = [];
  attributes: any[] = []; // Özellikleri tutacak dizi eklendi
  quantity: number = 1;
  reviewForm!: FormGroup;
  isLoading: boolean = true;
  errorLoading: boolean = false;
  isSubmittingReview: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadProductDetails(); // Ürün, yorum ve özellikleri yükle
    this.createReviewForm();
  }

  // Ürün, yorum ve özellikleri yükleyen metot
  loadProductDetails(): void {
    this.isLoading = true;
    this.errorLoading = false;
    this.product = null;
    this.reviews = [];
    this.attributes = []; // Başlangıçta temizle

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id');
          if (idParam) {
            const id = parseInt(idParam, 10);
            if (!isNaN(id)) {
              // Ürün, Yorumlar ve Özellikleri paralel olarak getir
              return forkJoin({
                product: this.productService.getProductById(id),
                reviews: this.productService.getReviewsByProductId(id),
                attributes: this.productService.getAttributesByProductId(id), // Özellikleri de getir
              }).pipe(
                catchError((err) => {
                  console.error('Error fetching product details:', err);
                  this.errorLoading = true;
                  // Hata durumunda tümünü boş döndür
                  return of({
                    product: undefined,
                    reviews: [],
                    attributes: [],
                  });
                })
              );
            }
          }
          // Geçersiz veya eksik ID durumu
          console.error('Invalid or missing Product ID parameter.');
          this.errorLoading = true;
          return of({ product: undefined, reviews: [], attributes: [] });
        })
      )
      .subscribe(({ product, reviews, attributes }) => {
        // Gelen objeyi destruct et
        this.isLoading = false;
        if (product) {
          this.product = product;
          this.reviews = reviews;
          this.attributes = attributes; // Özellikleri ata
          this.quantity = 1;
          console.log('Product loaded:', this.product);
          console.log('Reviews loaded:', this.reviews);
          console.log('Attributes loaded:', this.attributes);
        } else {
          this.product = null;
          this.reviews = [];
          this.attributes = [];
          console.log('Product could not be loaded.');
        }
      });
  }

  createReviewForm(): void {
    /* ... önceki kod aynı ... */ this.reviewForm = this.fb.group({
      rating: [
        null,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      comment: ['', Validators.required],
    });
  }
  onReviewSubmit(): void {
    /* ... önceki kod aynı ... */ if (
      this.reviewForm.invalid ||
      !this.product ||
      this.isSubmittingReview
    ) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.isSubmittingReview = true;
    const mockUserId = 205;
    const reviewData = {
      productId: this.product.id,
      userId: mockUserId,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment,
    };
    this.productService.addReview(reviewData).subscribe({
      next: (newReview) => {
        console.log('Review added successfully (mock):', newReview);
        this.reviews.unshift(newReview);
        this.reviewForm.reset();
        alert('Review submitted!');
        this.isSubmittingReview = false;
      },
      error: (err) => {
        console.error('Error submitting review (mock):', err);
        alert('Failed to submit review. Please try again.');
        this.isSubmittingReview = false;
      },
    });
  }
  incrementQuantity(): void {
    /* ... önceki kod aynı ... */ if (
      this.product &&
      this.quantity < this.product.stock_quantity
    ) {
      this.quantity++;
    }
  }
  decrementQuantity(): void {
    /* ... önceki kod aynı ... */ if (this.quantity > 1) {
      this.quantity--;
    }
  }
  addToCart(): void {
    /* ... önceki kod aynı ... */ if (
      this.product &&
      this.product.stock_quantity > 0
    ) {
      console.log(
        `Adding ${this.quantity} of ${this.product.name} (ID: ${this.product.id}) to cart.`
      );
      alert(
        `${this.quantity} x ${this.product.name} added to cart (simulation)!`
      );
    } else {
      console.warn('Cannot add to cart.');
    }
  }
}
