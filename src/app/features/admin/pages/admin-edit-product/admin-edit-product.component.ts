// src/app/features/admin/pages/admin-edit-product.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../features/product/services/product.service'; // Doğru yolu kontrol et
import { ToastrService } from 'ngx-toastr';
import { switchMap, catchError, filter } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-admin-edit-product',
  templateUrl: './admin-edit-product.component.html',
  styleUrls: ['./admin-edit-product.component.css'],
  standalone: false,
})
export class AdminEditProductComponent implements OnInit {
  productToEdit: any | null = null;
  isLoading: boolean = true;
  isUpdating: boolean = false;
  errorLoading: string | null = null;
  productId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.productToEdit = null;

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('productId'); // Rota parametresinin adı 'productId' olmalı
          if (!idParam) {
            this.errorLoading = 'Product ID is missing in the URL.';
            return of(null);
          }
          const productId = parseInt(idParam, 10);
          if (isNaN(productId)) {
            this.errorLoading = 'Invalid Product ID in the URL.';
            return of(null);
          }
          this.productId = productId;
          // Admin olduğu için direkt ID ile ürünü getir
          return this.productService.getProductById(productId).pipe(
            catchError((err) => {
              console.error('Error fetching product:', err);
              this.errorLoading = 'Failed to load product data.';
              return of(null);
            })
          );
        })
      )
      .subscribe((productData) => {
        this.isLoading = false;
        if (productData) {
          this.productToEdit = productData;
          console.log('Product loaded for admin editing:', this.productToEdit);
        } else if (!this.errorLoading) {
          this.errorLoading = 'Product not found.';
        }
        if (this.errorLoading) {
          this.toastr.error(this.errorLoading, 'Error');
        }
      });
  }

  // ProductFormComponent'ten gelen veriyi işleyen metot
  handleProductUpdate(formData: any): void {
    if (!this.productId) {
      this.toastr.error(
        'Cannot update product. Product ID is missing.',
        'Error'
      );
      return;
    }

    this.isUpdating = true;
    console.log('Form data received in AdminEditProductComponent:', formData);

    // Admin'e özel update metodunu çağır
    this.productService
      .updateProductAsAdmin(this.productId, formData)
      .subscribe({
        next: (updatedProduct) => {
          this.isUpdating = false;
          if (updatedProduct) {
            this.toastr.success(
              `Product "${updatedProduct.name}" updated successfully by Admin!`,
              'Success'
            );
            this.router.navigate(['/admin/products']); // Admin ürün listesine geri dön
          } else {
            this.toastr.error(
              `Failed to update product. It might not exist.`,
              'Error'
            );
          }
        },
        error: (err) => {
          this.isUpdating = false;
          console.error('Error updating product by admin:', err);
          this.toastr.error(
            'Failed to update product. Please try again.',
            'Error'
          );
        },
      });
  }

  // Formdan iptal eventi gelirse
  handleCancel(): void {
    this.router.navigate(['/admin/products']); // Admin ürün listesine geri dön
  }
}
