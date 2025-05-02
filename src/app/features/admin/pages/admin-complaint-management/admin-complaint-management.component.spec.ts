import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComplaintManagementComponent } from './admin-complaint-management.component';

describe('AdminComplaintManagementComponent', () => {
  let component: AdminComplaintManagementComponent;
  let fixture: ComponentFixture<AdminComplaintManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminComplaintManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminComplaintManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
