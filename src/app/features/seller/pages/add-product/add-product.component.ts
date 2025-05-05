import { Component, OnInit, inject } from '@angular/core'; // inject eklendi
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import {
  ProductService,
  ProductPayload,
} from '../../../../features/product/services/product.service'; // ProductPayload import edildi
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

  // Inject Dependencies
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    if (
      !this.currentSeller ||
      (this.currentSeller.role !== 'SELLER' &&
        this.currentSeller.role !== 'ADMIN')
    ) {
      this.toastr.error('Unauthorized access.', 'Error');
      this.router.navigate(['/']);
    }
  }

  // ProductFormComponent'ten gelen veriyi işleyen metot
  handleAddProduct(formData: ProductPayload): void {
    // formData tipi ProductPayload yapıldı
    if (!this.currentSeller) {
      this.toastr.error(
        'Cannot add product. Seller information is missing.',
        'Error'
      );
      return;
    }

    this.isLoading = true;
    console.log('Form data received in AddProductComponent:', formData);

    // --- DÜZELTME (TS2554) ---
    // addProduct artık sadece formData alıyor
    this.productService.addProduct(formData).subscribe({
      // --- DÜZELTME SONU ---
      next: (newProduct) => {
        this.isLoading = false;
        this.toastr.success(
          `Product "${newProduct.name}" added successfully!`,
          'Success'
        );
        this.router.navigate(['/seller/my-products']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error adding product:', err);
        this.toastr.error(
          err.message || 'Failed to add product. Please try again.',
          'Error'
        );
      },
    });
  }

  // Formdan iptal eventi gelirse
  handleCancel(): void {
    this.router.navigate(['/seller/my-products']);
  }
}
