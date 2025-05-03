import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerOrderManagementComponent } from './seller-order-management.component';

describe('SellerOrderManagementComponent', () => {
  let component: SellerOrderManagementComponent;
  let fixture: ComponentFixture<SellerOrderManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SellerOrderManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerOrderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
