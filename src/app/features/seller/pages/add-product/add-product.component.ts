import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ProductService } from '../../../../features/product/services/product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  standalone: false,
})
export class AddProductComponent implements OnInit {
  isLoading: boolean = false;
  currentSeller: User | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    // Ekstra güvenlik: Kullanıcı yoksa veya rolü uygun değilse (Guard zaten yapmalı)
    if (
      !this.currentSeller ||
      (this.currentSeller.role !== 'SELLER' &&
        this.currentSeller.role !== 'ADMIN')
    ) {
      this.toastr.error('Unauthorized access.', 'Error');
      this.router.navigate(['/']); // Ana sayfaya yönlendir
    }
  }

  // ProductFormComponent'ten gelen veriyi işleyen metot
  handleAddProduct(formData: any): void {
    if (!this.currentSeller) {
      this.toastr.error(
        'Cannot add product. Seller information is missing.',
        'Error'
      );
      return;
    }

    this.isLoading = true; // Yükleme başladı
    console.log('Form data received in AddProductComponent:', formData);

    this.productService.addProduct(formData, this.currentSeller.id).subscribe({
      next: (newProduct) => {
        this.isLoading = false; // Yükleme bitti
        this.toastr.success(
          `Product "${newProduct.name}" added successfully!`,
          'Success'
        );
        this.router.navigate(['/seller/my-products']); // Ürün listesine geri dön
      },
      error: (err) => {
        this.isLoading = false; // Yükleme bitti (hata ile)
        console.error('Error adding product:', err);
        this.toastr.error('Failed to add product. Please try again.', 'Error');
      },
    });
  }

  // Formdan iptal eventi gelirse
  handleCancel(): void {
    this.router.navigate(['/seller/my-products']); // Ürün listesine geri dön
  }
}
