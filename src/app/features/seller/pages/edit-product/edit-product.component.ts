import { Component, OnInit, inject } from '@angular/core'; // inject eklendi
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import {
  ProductService,
  Product,
  ProductPayload,
} from '../../../../features/product/services/product.service'; // Tipler import edildi
import { ToastrService } from 'ngx-toastr';
import { switchMap, catchError } from 'rxjs/operators'; // tap, filter kaldırıldı
import { of } from 'rxjs';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
  standalone: false,
})
export class EditProductComponent implements OnInit {
  productToEdit: Product | null = null; // Tip Product yapıldı
  isLoading: boolean = true;
  isUpdating: boolean = false;
  errorLoading: string | null = null;
  currentSeller: User | null = null;
  productId: number | null = null;

  // Inject Dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    if (
      !this.currentSeller ||
      (this.currentSeller.role !== 'SELLER' &&
        this.currentSeller.role !== 'ADMIN')
    ) {
      this.handleUnauthorized(); // Yetki yoksa işlemi başlatma
      return;
    }
    this.loadProductForEditing(); // Ürünü yükle
  }

  loadProductForEditing(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.productToEdit = null;

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id'); // Route'da 'id' olarak tanımlıysa
          if (!idParam) {
            this.errorLoading = 'Product ID is missing.';
            return of(null);
          }
          this.productId = parseInt(idParam, 10);
          if (isNaN(this.productId)) {
            this.errorLoading = 'Invalid Product ID.';
            return of(null);
          }
          return this.productService.getProductById(this.productId).pipe(
            catchError((err) => {
              console.error('Error fetching product:', err);
              this.errorLoading = err.message || 'Failed to load product data.';
              return of(null);
            })
          );
        })
      )
      .subscribe((productData) => {
        this.isLoading = false;
        if (productData) {
          // Yüklenen ürünün satıcısını kontrol et (AuthService'deki kullanıcı ID'si ile)
          if (
            this.currentSeller &&
            productData.seller_id === this.currentSeller.id
          ) {
            this.productToEdit = productData;
            console.log('Product loaded for editing:', this.productToEdit);
          } else {
            // Eğer Admin ise düzenleyebilir, değilse yetki hatası
            if (this.currentSeller?.role !== 'ADMIN') {
              console.error(
                `Unauthorized attempt by seller ${this.currentSeller?.id} to edit product ${this.productId} owned by ${productData.seller_id}`
              );
              this.errorLoading =
                'You do not have permission to edit this product.';
              this.toastr.error(this.errorLoading, 'Access Denied');
              this.productToEdit = null;
              this.router.navigate(['/seller/my-products']); // Listeye geri dön
            } else {
              // Admin ise ürünü ata
              this.productToEdit = productData;
              console.log(
                'Product loaded for editing by ADMIN:',
                this.productToEdit
              );
            }
          }
        } else if (!this.errorLoading) {
          this.errorLoading = 'Product not found.';
        }
        if (this.errorLoading && !this.productToEdit) {
          // Hata varsa ve ürün yüklenemediyse göster
          this.toastr.error(this.errorLoading, 'Error');
        }
      });
  }

  // ProductFormComponent'ten gelen veriyi işleyen metot
  handleProductUpdate(formData: Partial<ProductPayload>): void {
    // formData tipi Partial<ProductPayload> yapıldı
    if (!this.productId || !this.currentSeller) {
      this.toastr.error(
        'Cannot update product. Essential information is missing.',
        'Error'
      );
      return;
    }

    this.isUpdating = true;
    console.log('Form data received in EditProductComponent:', formData);

    // --- DÜZELTME (TS2554) ---
    // updateProduct artık sadece productId ve formData alıyor
    this.productService.updateProduct(this.productId, formData).subscribe({
      // --- DÜZELTME SONU ---
      next: (updatedProduct) => {
        this.isUpdating = false;
        this.toastr.success(
          `Product "${updatedProduct.name}" updated successfully!`,
          'Success'
        );
        this.router.navigate(['/seller/my-products']);
      },
      error: (err) => {
        this.isUpdating = false;
        console.error('Error updating product:', err);
        this.toastr.error(
          err.message || 'Failed to update product. Please try again.',
          'Error'
        );
      },
    });
  }

  // Formdan iptal eventi gelirse
  handleCancel(): void {
    this.router.navigate(['/seller/my-products']);
  }

  // Yetkisiz erişim durumu
  handleUnauthorized(): void {
    this.toastr.error('Unauthorized access.', 'Error');
    this.isLoading = false; // Yüklemeyi durdur
    this.router.navigate(['/']); // Ana sayfaya yönlendir
  }
}
