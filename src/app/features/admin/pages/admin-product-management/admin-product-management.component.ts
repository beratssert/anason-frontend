import { Component, OnInit, inject } from '@angular/core'; // inject eklendi
import {
  ProductService,
  Product,
} from '../../../../features/product/services/product.service'; // Product import edildi
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router'; // Router import edildi

@Component({
  selector: 'app-admin-product-management',
  templateUrl: './admin-product-management.component.html',
  styleUrls: ['./admin-product-management.component.css'],
  standalone: false,
})
export class AdminProductManagementComponent implements OnInit {
  allProducts: Product[] = []; // Tip Product[] yapıldı
  isLoading: boolean = true;
  deletingProductId: number | null = null;

  // Inject Dependencies
  private productService = inject(ProductService);
  private toastr = inject(ToastrService);
  private router = inject(Router); // Router inject edildi

  ngOnInit(): void {
    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        // Service zaten tarihi mapliyor, burada tekrar maplemeye gerek yok.
        // Eğer TS hatası devam ederse, DİKKATLİCE burada map'leyebiliriz:
        // this.allProducts = data.map((p) => ({
        //   ...p,
        //   created_at: p.created_at ? new Date(p.created_at) : undefined, // Güvenlik kontrolü
        // }));
        this.allProducts = data; // Service'ten geleni doğrudan ata
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading all products:', err);
        this.toastr.error(err.message || 'Failed to load products.', 'Error');
        this.isLoading = false;
      },
    });
  }

  deleteProduct(product: Product): void {
    // Tip Product yapıldı
    if (!product) return;

    if (
      !confirm(
        `ADMIN ACTION: Are you sure you want to delete product "${product.name}" (ID: ${product.id})? This action cannot be undone.`
      )
    ) {
      return;
    }

    this.deletingProductId = product.id;

    // Admin'e özel silme metodunu çağır
    this.productService.deleteProductByIdAsAdmin(product.id).subscribe({
      // --- DÜZELTME (TS1345) ---
      // next callback'i çalışırsa başarılı kabul et, 'success' parametresi yok
      next: () => {
        this.toastr.success(
          `Product "${product.name}" deleted successfully by Admin.`,
          'Success'
        );
        // Ürünü listeden filtrele
        this.allProducts = this.allProducts.filter((p) => p.id !== product.id);
        this.deletingProductId = null; // İşlem bitti
      },
      // --- DÜZELTME SONU ---
      error: (err) => {
        console.error(`Error deleting product ${product.id} by Admin:`, err);
        this.toastr.error(
          err.message || 'An error occurred while deleting the product.',
          'Error'
        );
        this.deletingProductId = null;
      },
    });
  }

  // Admin'in ürün düzenleme sayfasına gitmesi için
  goToEditProductAsAdmin(productId: number): void {
    this.router.navigate(['/admin/products', productId, 'edit']);
  }
}
