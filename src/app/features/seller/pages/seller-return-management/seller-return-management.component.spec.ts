import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerReturnManagementComponent } from './seller-return-management.component';

describe('SellerReturnManagementComponent', () => {
  let component: SellerReturnManagementComponent;
  let fixture: ComponentFixture<SellerReturnManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SellerReturnManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerReturnManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
