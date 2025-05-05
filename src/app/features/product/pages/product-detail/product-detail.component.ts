import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Router eklendi
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ProductService,
  Product,
  Review,
  ProductAttribute,
  AddReviewPayload,
} from '../../services/product.service'; // Tipler import
import { CartService } from '../../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs'; // of eklendi
import { switchMap, catchError } from 'rxjs/operators'; // catchError eklendi
import { ComparisonService } from '../../../../core/services/comparison.service';
import { AuthService, User } from '../../../../core/services/auth.service'; // User import edildi

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: false,
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  attributes: ProductAttribute[] = [];
  quantity: number = 1;
  reviewForm!: FormGroup;
  isLoading: boolean = true;
  errorLoading: string | null = null;
  isSubmittingReview: boolean = false;
  currentUser: User | null = null; // Current user eklendi

  // Inject Dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router); // Router inject edildi
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private toastr = inject(ToastrService);
  private comparisonService = inject(ComparisonService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue; // Kullanıcı bilgisini al
    this.loadProductDetails();
    this.createReviewForm();
  }

  loadProductDetails(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.product = null;
    this.reviews = [];
    this.attributes = [];

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id');
          if (!idParam) {
            this.errorLoading = 'Product ID is missing.';
            return of({ product: undefined, reviews: [], attributes: [] });
          }
          const id = parseInt(idParam, 10);
          if (isNaN(id)) {
            this.errorLoading = 'Invalid Product ID.';
            return of({ product: undefined, reviews: [], attributes: [] });
          }
          // Tüm detayları paralel çek
          return forkJoin({
            product: this.productService.getProductById(id),
            reviews: this.productService.getReviewsByProductId(id),
            attributes: this.productService.getAttributesByProductId(id),
          }).pipe(
            catchError((err) => {
              // Ana forkJoin için de hata yakalama
              console.error('Error fetching product details:', err);
              this.errorLoading =
                err.message || 'Failed to load product details.';
              return of({ product: undefined, reviews: [], attributes: [] });
            })
          );
        })
      )
      .subscribe(({ product, reviews, attributes }) => {
        this.isLoading = false;
        if (product) {
          this.product = product;
          this.reviews = reviews;
          this.attributes = attributes;
          this.quantity = 1;
        } else if (!this.errorLoading) {
          this.errorLoading = 'Product not found.';
        }
        if (this.errorLoading) {
          this.toastr.error(this.errorLoading, 'Error');
        }
      });
  }

  createReviewForm(): void {
    this.reviewForm = this.fb.group({
      rating: [
        null,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      comment: ['', Validators.required],
    });
  }

  onReviewSubmit(): void {
    if (this.reviewForm.invalid || !this.product || this.isSubmittingReview) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    if (!this.currentUser) {
      this.toastr.warning(
        'Please log in to submit a review.',
        'Login Required'
      );
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.isSubmittingReview = true;
    const payload: AddReviewPayload = {
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment,
    };

    this.productService.addReview(this.product.id, payload).subscribe({
      next: (newReview) => {
        this.reviews.unshift(newReview); // Yeni yorumu başa ekle
        this.reviewForm.reset();
        // Formun validasyon durumunu temizle
        Object.keys(this.reviewForm.controls).forEach((key) => {
          this.reviewForm.get(key)?.setErrors(null);
          this.reviewForm.get(key)?.markAsPristine();
          this.reviewForm.get(key)?.markAsUntouched();
        });
        this.reviewForm.updateValueAndValidity();

        this.toastr.success('Review submitted successfully!', 'Success');
        this.isSubmittingReview = false;
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.toastr.error(
          err.message || 'Failed to submit review. Please try again.',
          'Error'
        );
        this.isSubmittingReview = false;
      },
    });
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock_quantity) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (
      this.product &&
      this.product.stock_quantity >= this.quantity &&
      this.quantity > 0
    ) {
      this.cartService.addItem(this.product.id, this.quantity);
      this.toastr.success(
        `${this.quantity} x ${this.product.name} added to cart!`,
        'Added to Cart'
      );
    } else {
      this.toastr.error(
        'Cannot add this item to cart. Check stock or quantity.',
        'Error'
      );
    }
  }

  addToCompare(): void {
    if (!this.product) return;
    const success = this.comparisonService.addToCompare(this.product.id);
    if (success) {
      this.toastr.success(
        `${this.product.name} added to comparison list.`,
        'Compare'
      );
    } else {
      this.toastr.info(
        `Could not add ${this.product.name}. Check if it's already added or if the list is full (max 4).`,
        'Compare'
      );
    }
  }
}
