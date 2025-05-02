import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderRoutingModule } from './order-routing.module';
import { OrderComponent } from './order.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';


@NgModule({
  declarations: [
    OrderComponent,
    OrderHistoryComponent
  ],
  imports: [
    CommonModule,
    OrderRoutingModule
  ]
})
export class OrderModule { }
