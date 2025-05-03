import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductFormComponent } from './components/product-form/product-form.component';

@NgModule({
  declarations: [ProductFormComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [
    ProductFormComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
