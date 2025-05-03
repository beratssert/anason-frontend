import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shipping-address',
  templateUrl: './shipping-address.component.html',
  styleUrls: ['./shipping-address.component.css'],
  standalone: false,
})
export class ShippingAddressComponent implements OnInit {
  shippingAddressForm!: FormGroup;
  isSubmitting: boolean = false;

  // Opsiyonel: Adres kaydedildiğinde parent component'ı bilgilendirmek için
  @Output() addressSubmitted = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private toastr: ToastrService) {}

  ngOnInit(): void {
    // SQL şemasındaki 'addresses' tablosuna uygun form kontrolleri
    this.shippingAddressForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$'),
        ],
      ], // Basit telefon deseni
      address_line: ['', Validators.required],
      city: ['', Validators.required],
      state: [''], // Zorunlu olmayabilir
      country: ['', Validators.required],
      postal_code: ['', Validators.required],
      // is_default alanı genellikle adres listesinden seçilirken veya ayrı yönetilir
      // user_id backend'den veya AuthService'ten alınır
    });

    // TODO: Eğer kullanıcının kayıtlı adresleri varsa, bunları getirme
    // ve seçme/düzenleme mantığı eklenebilir. Şimdilik sadece yeni adres formu.
  }

  onSubmit(): void {
    if (this.shippingAddressForm.invalid) {
      this.shippingAddressForm.markAllAsTouched();
      this.toastr.warning(
        'Please fill all required address fields correctly.',
        'Invalid Form'
      );
      return;
    }

    this.isSubmitting = true;
    console.log(
      'Shipping Address Submitted (Mock):',
      this.shippingAddressForm.value
    );

    // Gerçek uygulamada:
    // 1. Adresi kaydetmek için AddressService çağrılır.
    // 2. Başarılı olursa addressSubmitted eventi emit edilir veya sonraki adıma geçilir.
    // 3. Hata olursa toastr ile mesaj gösterilir.

    // Mock başarı simülasyonu
    setTimeout(() => {
      this.toastr.success('Shipping address saved (mock).', 'Success');
      this.addressSubmitted.emit(this.shippingAddressForm.value); // Parent'a bilgiyi gönder
      this.isSubmitting = false;
      // Formu kitleme veya sonraki adıma geçiş mantığı eklenebilir
      // this.shippingAddressForm.disable();
    }, 500);
  }

  // Form kontrollerine kolay erişim için getter'lar (opsiyonel)
  get fullName() {
    return this.shippingAddressForm.get('full_name');
  }
  get phone() {
    return this.shippingAddressForm.get('phone');
  }
  get addressLine() {
    return this.shippingAddressForm.get('address_line');
  }
  get city() {
    return this.shippingAddressForm.get('city');
  }
  get state() {
    return this.shippingAddressForm.get('state');
  }
  get country() {
    return this.shippingAddressForm.get('country');
  }
  get postalCode() {
    return this.shippingAddressForm.get('postal_code');
  }
}
