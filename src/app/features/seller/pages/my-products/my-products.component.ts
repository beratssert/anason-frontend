import { Component, OnInit, inject } from '@angular/core'; // inject eklendi
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import {
  ProductService,
  Product,
} from '../../../../features/product/services/product.service'; // Product import edildi
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.css'],
  standalone: false,
})
export class MyProductsComponent implements OnInit {
  myProducts: Product[] = []; // Tip Product[] yapıldı
  isLoading: boolean = true;
  currentSeller: User | null = null;
  deletingProductId: number | null = null;

  // Inject Dependencies
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    if (
      this.currentSeller &&
      (this.currentSeller.role === 'SELLER' ||
        this.currentSeller.role === 'ADMIN')
    ) {
      this.loadProducts(); // Argüman kaldırıldı
    } else {
      this.toastr.error(
        'You do not have permission to view this page.',
        'Unauthorized'
      );
      this.isLoading = false;
      this.router.navigate(['/']);
    }
  }

  loadProducts(): void {
    // Argüman kaldırıldı
    this.isLoading = true;
    // --- DÜZELTME (TS2554) ---
    // getProductsBySellerId artık argüman almıyor
    this.productService.getProductsBySellerId().subscribe({
      // --- DÜZELTME SONU ---
      next: (data) => {
        this.myProducts = data; // Service zaten mapliyor
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading seller products:', err);
        this.toastr.error(
          err.message || 'Failed to load your products.',
          'Error'
        );
        this.isLoading = false;
      },
    });
  }

  deleteProduct(product: Product): void {
    // Tip Product yapıldı
    if (!this.currentSeller || !product) return;

    if (
      !confirm(
        `Are you sure you want to delete product "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    this.deletingProductId = product.id;

    // --- DÜZELTME (TS2554) ---
    // deleteProduct artık sadece productId alıyor
    this.productService.deleteProduct(product.id).subscribe({
      // --- DÜZELTME SONU ---

      // --- DÜZELTME (TS1345) ---
      // next callback'i çalışırsa başarılı kabul et
      next: () => {
        this.toastr.success(
          `Product "${product.name}" deleted successfully.`,
          'Success'
        );
        this.myProducts = this.myProducts.filter((p) => p.id !== product.id);
        this.deletingProductId = null;
      },
      // --- DÜZELTME SONU ---
      error: (err) => {
        console.error(`Error deleting product ${product.id}:`, err);
        this.toastr.error(
          err.message || 'An error occurred while deleting the product.',
          'Error'
        );
        this.deletingProductId = null;
      },
    });
  }

  goToAddProduct(): void {
    this.router.navigate(['/seller/add-product']);
  }

  goToEditProduct(productId: number): void {
    this.router.navigate(['/seller/edit-product', productId]);
  }
}
