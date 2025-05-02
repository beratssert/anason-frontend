import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../features/product/services/product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-product-management',
  templateUrl: './admin-product-management.component.html',
  styleUrls: ['./admin-product-management.component.css'],
  standalone: false,
})
export class AdminProductManagementComponent implements OnInit {
  allProducts: any[] = [];
  isLoading: boolean = true;
  deletingProductId: number | null = null;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      // getProducts() tüm ürünleri getirir
      next: (data) => {
        // Tarihleri Date objesine çevirmek iyi olabilir (eğer sıralama vs. yapılacaksa)
        this.allProducts = data.map((p) => ({
          ...p,
          created_at: new Date(p.created_at),
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading all products:', err);
        this.toastr.error('Failed to load products.', 'Error');
        this.isLoading = false;
      },
    });
  }

  deleteProduct(product: any): void {
    if (!product) return;

    if (
      !confirm(
        `ADMIN ACTION: Are you sure you want to delete product "${product.name}" (ID: ${product.id}, Seller: ${product.seller_id})? This action cannot be undone.`
      )
    ) {
      return;
    }

    this.deletingProductId = product.id;

    // Admin'e özel silme metodunu çağır
    this.productService.deleteProductByIdAsAdmin(product.id).subscribe({
      next: (success) => {
        if (success) {
          this.toastr.success(
            `Product "${product.name}" deleted successfully by Admin.`,
            'Success'
          );
          this.allProducts = this.allProducts.filter(
            (p) => p.id !== product.id
          );
        } else {
          this.toastr.error(
            `Failed to delete product "${product.name}". It might already be deleted.`,
            'Error'
          );
        }
        this.deletingProductId = null;
      },
      error: (err) => {
        console.error(`Error deleting product ${product.id} by Admin:`, err);
        this.toastr.error(
          'An error occurred while deleting the product.',
          'Error'
        );
        this.deletingProductId = null;
      },
    });
  }

  // İleride Admin'in ürün düzenlemesi için metot eklenebilir
  // goToEditProductAsAdmin(productId: number): void { ... }
}
