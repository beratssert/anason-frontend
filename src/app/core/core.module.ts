import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router'; // RouterModule'ı import et

@NgModule({
  declarations: [HeaderComponent, FooterComponent, LayoutComponent],
  imports: [
    CommonModule,
    RouterModule, // RouterModule'ı buraya ekle (router-outlet için gerekli)
  ],
  exports: [
    LayoutComponent, // LayoutComponent'i dışa aktar
    // HeaderComponent ve FooterComponent'i dışa aktarmak genellikle
    // gerekli olmaz çünkü sadece LayoutComponent içinde kullanılıyorlar,
    // ama istersen ekleyebilirsin, zararı olmaz.
    // HeaderComponent,
    // FooterComponent
  ],
})
export class CoreModule {}
