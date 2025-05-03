import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompareRoutingModule } from './compare-routing.module';
import { CompareComponent } from './compare.component';
import { ComparePageComponent } from './pages/compare-page/compare-page.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [CompareComponent, ComparePageComponent],
  imports: [CommonModule, CompareRoutingModule, RouterModule, SharedModule],
})
export class CompareModule {}
