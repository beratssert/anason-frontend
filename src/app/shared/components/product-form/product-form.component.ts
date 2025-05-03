import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  standalone: false,
})
export class ProductFormComponent implements OnInit, OnChanges {
  // Input: Düzenleme modu için mevcut ürün verisi (opsiyonel)
  @Input() productData: any | null = null;
  // Input: Form gönderilirken bekleme durumunu göstermek için (opsiyonel)
  @Input() isLoading: boolean = false;
  // Output: Form geçerli ve gönderildiğinde tetiklenir, form verisini dışarı aktarır
  @Output() formSubmit = new EventEmitter<any>();
  // Output: İptal butonu için (opsiyonel)
  @Output() formCancel = new EventEmitter<void>();

  productForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  // Input propertysi değiştiğinde çalışır (özellikle productData)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productData'] && this.productData && this.productForm) {
      console.log('Patching form with product data:', this.productData);
      this.isEditMode = true; // Düzenleme modunda olduğumuzu belirt
      // Gelen productData ile formu doldur (patchValue eksik alanları görmezden gelir)
      this.productForm.patchValue({
        name: this.productData.name,
        description: this.productData.description,
        price: this.productData.price,
        stock_quantity: this.productData.stock_quantity,
        category: this.productData.category,
        image_url: this.productData.image_url,
      });
    } else {
      this.isEditMode = false;
    }
  }

  // Formu başlatan metot
  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]], // Fiyat 0'dan büyük olmalı
      stock_quantity: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]*$'),
        ],
      ], // Stok negatif olamaz, sadece sayı
      category: ['', Validators.required],
      image_url: ['', [Validators.pattern('https?://.+')]], // Basit URL deseni (opsiyonel)
      // seller_id ve id gibi alanlar backend'de yönetilir, formda olmaz
    });

    // Eğer component oluşturulduğunda productData zaten varsa, formu doldur
    if (this.productData) {
      this.isEditMode = true;
      this.productForm.patchValue(this.productData);
    }
  }

  // Form gönderildiğinde çalışır
  onSubmit(): void {
    if (this.productForm.invalid || this.isLoading) {
      this.productForm.markAllAsTouched(); // Geçersizse hataları göster
      console.log('Form is invalid or submitting:', this.productForm.value);
      return;
    }
    // Form verisini parent component'a gönder
    this.formSubmit.emit(this.productForm.value);
  }

  // İptal butonuna basıldığında (opsiyonel)
  onCancelClick(): void {
    this.formCancel.emit();
  }

  // Form kontrollerine kolay erişim (template'te validasyon için)
  get name() {
    return this.productForm.get('name');
  }
  get description() {
    return this.productForm.get('description');
  }
  get price() {
    return this.productForm.get('price');
  }
  get stock_quantity() {
    return this.productForm.get('stock_quantity');
  }
  get category() {
    return this.productForm.get('category');
  }
  get image_url() {
    return this.productForm.get('image_url');
  }
}
