import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ProductService } from '../../../../features/product/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap, catchError, tap, filter } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
  standalone: false,
})
export class EditProductComponent implements OnInit {
  productToEdit: any | null = null;
  isLoading: boolean = true;
  isUpdating: boolean = false;
  errorLoading: string | null = null;
  currentSeller: User | null = null;
  productId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;

    this.route.paramMap
      .pipe(
        tap(() => {
          // Yeni ID geldiğinde state'i sıfırla
          this.isLoading = true;
          this.errorLoading = null;
          this.productToEdit = null;
        }),
        switchMap((params) => {
          const idParam = params.get('id');
          if (!idParam) {
            this.errorLoading = 'Product ID is missing.';
            return of(null); // Eksik ID ise null Observable döndür
          }
          this.productId = parseInt(idParam, 10);
          if (isNaN(this.productId)) {
            this.errorLoading = 'Invalid Product ID.';
            return of(null); // Geçersiz ID ise null Observable döndür
          }
          // ProductService'ten ürünü getir
          return this.productService.getProductById(this.productId).pipe(
            catchError((err) => {
              console.error('Error fetching product:', err);
              this.errorLoading = 'Failed to load product data.';
              return of(null); // Hata durumunda null döndür
            })
          );
        })
      )
      .subscribe((productData) => {
        this.isLoading = false;
        if (productData) {
          // !! ÖNEMLİ: Ürünün satıcıya ait olup olmadığını kontrol et !!
          if (
            this.currentSeller &&
            productData.seller_id === this.currentSeller.id
          ) {
            this.productToEdit = productData;
            console.log('Product loaded for editing:', this.productToEdit);
          } else {
            console.error(
              'Unauthorized attempt to edit product ID:',
              this.productId
            );
            this.errorLoading =
              'You do not have permission to edit this product.';
            this.toastr.error(this.errorLoading, 'Access Denied');
            this.productToEdit = null;
            // Belki /seller/my-products'a yönlendirme de eklenebilir
          }
        } else if (!this.errorLoading) {
          // Hata yoksa ama ürün de yoksa (servisten undefined/null geldiyse)
          this.errorLoading = 'Product not found.';
        }
        // Hata varsa zaten mesaj set edildi
      });
  }

  // ProductFormComponent'ten gelen veriyi işleyen metot
  handleProductUpdate(formData: any): void {
    if (!this.productId || !this.currentSeller) {
      this.toastr.error(
        'Cannot update product. Essential information is missing.',
        'Error'
      );
      return;
    }

    this.isUpdating = true; // Güncelleme başladı
    console.log('Form data received in EditProductComponent:', formData);

    this.productService
      .updateProduct(this.productId, formData, this.currentSeller.id)
      .subscribe({
        next: (updatedProduct) => {
          this.isUpdating = false; // Güncelleme bitti
          if (updatedProduct) {
            this.toastr.success(
              `Product "${updatedProduct.name}" updated successfully!`,
              'Success'
            );
            this.router.navigate(['/seller/my-products']); // Ürün listesine geri dön
          } else {
            this.toastr.error(
              `Failed to update product. It might not exist or belong to you.`,
              'Error'
            );
          }
        },
        error: (err) => {
          this.isUpdating = false; // Güncelleme bitti (hata ile)
          console.error('Error updating product:', err);
          this.toastr.error(
            'Failed to update product. Please try again.',
            'Error'
          );
        },
      });
  }

  // Formdan iptal eventi gelirse
  handleCancel(): void {
    this.router.navigate(['/seller/my-products']); // Ürün listesine geri dön
  }
}
