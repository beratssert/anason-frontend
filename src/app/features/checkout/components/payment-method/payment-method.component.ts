import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css'],
  standalone: false,
})
export class PaymentMethodComponent {
  // Başlangıçta Stripe seçili olsun
  selectedMethod: string | null = 'stripe';

  @Output() paymentMethodSelected = new EventEmitter<string | null>();

  constructor() {}

  // Bu metot artık tek seçenek olduğu için daha az kritik ama kalabilir
  onMethodChange(): void {
    console.log('Payment method selected:', this.selectedMethod);
    this.paymentMethodSelected.emit(this.selectedMethod);
    // Component ilk yüklendiğinde de emit etmek gerekebilir
    // ngOnInit içinde this.paymentMethodSelected.emit(this.selectedMethod); çağrılabilir
  }
}
