import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ProductService } from '../../../../features/product/services/product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.css'],
  standalone: false,
})
export class MyProductsComponent implements OnInit {
  myProducts: any[] = [];
  isLoading: boolean = true;
  currentSeller: User | null = null;
  deletingProductId: number | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    if (
      this.currentSeller &&
      (this.currentSeller.role === 'SELLER' ||
        this.currentSeller.role === 'ADMIN')
    ) {
      this.loadProducts(this.currentSeller.id);
    } else {
      this.toastr.error(
        'You do not have permission to view this page.',
        'Unauthorized'
      );
      this.isLoading = false;
      this.router.navigate(['/']); // Yetkisizse ana sayfaya yönlendir
    }
  }

  loadProducts(sellerId: number): void {
    this.isLoading = true;
    this.productService.getProductsBySellerId(sellerId).subscribe({
      next: (data) => {
        this.myProducts = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading seller products:', err);
        this.toastr.error('Failed to load your products.', 'Error');
        this.isLoading = false;
      },
    });
  }

  deleteProduct(product: any): void {
    if (!this.currentSeller || !product) return;

    if (
      !confirm(
        `Are you sure you want to delete product "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    this.deletingProductId = product.id;

    this.productService
      .deleteProduct(product.id, this.currentSeller.id)
      .subscribe({
        next: (success) => {
          if (success) {
            this.toastr.success(
              `Product "${product.name}" deleted successfully.`,
              'Success'
            );
            this.myProducts = this.myProducts.filter(
              (p) => p.id !== product.id
            );
          } else {
            this.toastr.error(
              `Failed to delete product "${product.name}".`,
              'Error'
            );
          }
          this.deletingProductId = null;
        },
        error: (err) => {
          console.error(`Error deleting product ${product.id}:`, err);
          this.toastr.error(
            'An error occurred while deleting the product.',
            'Error'
          );
          this.deletingProductId = null;
        },
      });
  }

  goToAddProduct(): void {
    this.toastr.info(
      'Add Product functionality will be implemented later.',
      'Info'
    );
    // this.router.navigate(['/seller/add-product']); // Gelecekteki rota
  }

  goToEditProduct(productId: number): void {
    this.toastr.info(
      'Edit Product functionality will be implemented later.',
      'Info'
    );
    // this.router.navigate(['/seller/edit-product', productId]); // Gelecekteki rota
  }
}
