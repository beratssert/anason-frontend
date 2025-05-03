import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr'; // ToastrService import edildi
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ComparisonService } from '../../../../core/services/comparison.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: false,
})
export class ProductDetailComponent implements OnInit {
  product: any | null = null;
  reviews: any[] = [];
  attributes: any[] = [];
  quantity: number = 1;
  reviewForm!: FormGroup;
  isLoading: boolean = true;
  errorLoading: boolean = false;
  isSubmittingReview: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder,
    private cartService: CartService,
    private toastr: ToastrService,
    private comparisonService: ComparisonService
  ) {}

  ngOnInit(): void {
    this.loadProductDetails();
    this.createReviewForm();
  }

  loadProductDetails(): void {
    this.isLoading = true;
    this.errorLoading = false;
    this.product = null;
    this.reviews = [];
    this.attributes = [];

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id');
          if (idParam) {
            const id = parseInt(idParam, 10);
            if (!isNaN(id)) {
              return forkJoin({
                product: this.productService.getProductById(id),
                reviews: this.productService.getReviewsByProductId(id),
                attributes: this.productService.getAttributesByProductId(id),
              }).pipe(
                catchError((err) => {
                  console.error('Error fetching product details:', err);
                  this.errorLoading = true;
                  return of({
                    product: undefined,
                    reviews: [],
                    attributes: [],
                  });
                })
              );
            }
          }
          console.error('Invalid or missing Product ID parameter.');
          this.errorLoading = true;
          return of({ product: undefined, reviews: [], attributes: [] });
        })
      )
      .subscribe(({ product, reviews, attributes }) => {
        this.isLoading = false;
        if (product) {
          this.product = product;
          this.reviews = reviews;
          this.attributes = attributes;
          this.quantity = 1;
        } else {
          this.product = null;
          this.reviews = [];
          this.attributes = [];
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
        this.reviews.unshift(newReview);
        this.reviewForm.reset();
        this.toastr.success('Review submitted successfully!', 'Success'); // Toastr kullanıldı
        this.isSubmittingReview = false;
      },
      error: (err) => {
        console.error('Error submitting review (mock):', err);
        this.toastr.error(
          'Failed to submit review. Please try again.',
          'Error'
        ); // Toastr kullanıldı
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
    if (this.product && this.product.stock_quantity > 0 && this.quantity > 0) {
      this.cartService.addItem(this.product, this.quantity);
      // alert yerine toastr kullanıldı
      this.toastr.success(
        `${this.quantity} x ${this.product.name} added to cart!`,
        'Added to Cart'
      );
    } else {
      // alert yerine toastr kullanıldı
      this.toastr.error(
        'Cannot add this item to cart. Check stock or quantity.',
        'Error'
      );
    }
  }

  addToCompare(): void {
    if (!this.product) return; // Ürün yüklenmemişse çık

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
